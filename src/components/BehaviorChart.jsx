import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const BehaviorChart = ({ data }) => {
  const COLORS = {
    positive: '#10B981',
    neutral: '#6B7280',
    negative: '#EF4444'
  };

  const SEVERITY_COLORS = {
    low: '#3B82F6',
    medium: '#F59E0B',
    high: '#F97316',
    critical: '#DC2626'
  };

  // Process data for timeline chart
  const timelineData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const grouped = {};
    
    data.forEach(log => {
      const date = new Date(log.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!grouped[date]) {
        grouped[date] = { date, positive: 0, neutral: 0, negative: 0 };
      }
      
      grouped[date][log.behaviorType]++;
    });

    return Object.values(grouped).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  }, [data]);

  // Process data for behavior type distribution
  const distributionData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const counts = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    data.forEach(log => {
      counts[log.behaviorType]++;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: COLORS[name]
    }));
  }, [data]);

  // Process data for severity distribution
  const severityData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const counts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    data.forEach(log => {
      counts[log.severity]++;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        fill: SEVERITY_COLORS[name]
      }))
      .filter(item => item.value > 0);
  }, [data]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for visualization
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Behavior Timeline */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Behavior Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              style={{ fontSize: '12px' }}
            />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="positive" 
              stroke={COLORS.positive} 
              strokeWidth={2}
              dot={{ fill: COLORS.positive }}
              name="Positive"
            />
            <Line 
              type="monotone" 
              dataKey="neutral" 
              stroke={COLORS.neutral} 
              strokeWidth={2}
              dot={{ fill: COLORS.neutral }}
              name="Neutral"
            />
            <Line 
              type="monotone" 
              dataKey="negative" 
              stroke={COLORS.negative} 
              strokeWidth={2}
              dot={{ fill: COLORS.negative }}
              name="Negative"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Behavior Type Distribution */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Behavior Type Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium">Positive Behaviors</div>
          <div className="text-2xl font-bold text-green-700">
            {data.filter(log => log.behaviorType === 'positive').length}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Neutral Behaviors</div>
          <div className="text-2xl font-bold text-gray-700">
            {data.filter(log => log.behaviorType === 'neutral').length}
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-600 font-medium">Negative Behaviors</div>
          <div className="text-2xl font-bold text-red-700">
            {data.filter(log => log.behaviorType === 'negative').length}
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Total Incidents</div>
          <div className="text-2xl font-bold text-blue-700">
            {data.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorChart;
