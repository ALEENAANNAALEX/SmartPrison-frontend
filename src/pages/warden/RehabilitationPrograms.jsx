import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import { 
  FaHeartbeat, 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaEye, 
  FaEdit,
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaGraduationCap,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaPlay,
  FaPause
} from 'react-icons/fa';

const RehabilitationPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for rehabilitation programs
  const mockPrograms = [
    {
      id: 1,
      name: 'Anger Management Workshop',
      category: 'Behavioral',
      description: 'Comprehensive anger management and conflict resolution program',
      instructor: 'Dr. Sarah Wilson',
      duration: '8 weeks',
      schedule: 'Tuesdays & Thursdays, 2:00 PM - 4:00 PM',
      location: 'Counseling Center - Room A',
      capacity: 15,
      enrolled: 12,
      completed: 8,
      status: 'Active',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      completionRate: 67,
      effectiveness: 85
    },
    {
      id: 2,
      name: 'Vocational Training - Carpentry',
      category: 'Vocational',
      description: 'Basic to intermediate carpentry skills training',
      instructor: 'Mike Johnson',
      duration: '12 weeks',
      schedule: 'Monday to Friday, 9:00 AM - 12:00 PM',
      location: 'Workshop Building',
      capacity: 20,
      enrolled: 18,
      completed: 15,
      status: 'Active',
      startDate: '2024-01-08',
      endDate: '2024-04-08',
      completionRate: 83,
      effectiveness: 92
    },
    {
      id: 3,
      name: 'Substance Abuse Recovery',
      category: 'Addiction',
      description: 'Comprehensive substance abuse treatment and recovery program',
      instructor: 'Dr. Lisa Chen',
      duration: '16 weeks',
      schedule: 'Mondays, Wednesdays, Fridays, 10:00 AM - 12:00 PM',
      location: 'Medical Wing - Therapy Room',
      capacity: 12,
      enrolled: 10,
      completed: 6,
      status: 'Active',
      startDate: '2023-12-01',
      endDate: '2024-04-01',
      completionRate: 60,
      effectiveness: 78
    },
    {
      id: 4,
      name: 'Financial Literacy',
      category: 'Education',
      description: 'Basic financial planning and money management skills',
      instructor: 'Robert Brown',
      duration: '6 weeks',
      schedule: 'Saturdays, 1:00 PM - 3:00 PM',
      location: 'Education Center',
      capacity: 25,
      enrolled: 22,
      completed: 20,
      status: 'Completed',
      startDate: '2023-11-01',
      endDate: '2023-12-15',
      completionRate: 91,
      effectiveness: 88
    },
    {
      id: 5,
      name: 'Life Skills Development',
      category: 'Life Skills',
      description: 'Essential life skills for successful reintegration',
      instructor: 'Maria Rodriguez',
      duration: '10 weeks',
      schedule: 'Tuesdays & Thursdays, 3:00 PM - 5:00 PM',
      location: 'Community Room',
      capacity: 18,
      enrolled: 0,
      completed: 0,
      status: 'Scheduled',
      startDate: '2024-02-01',
      endDate: '2024-04-15',
      completionRate: 0,
      effectiveness: 0
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPrograms(mockPrograms);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || program.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || program.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      'Active': 'bg-green-100 text-green-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'On Hold': 'bg-yellow-100 text-yellow-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Behavioral': 'bg-purple-100 text-purple-800',
      'Vocational': 'bg-blue-100 text-blue-800',
      'Addiction': 'bg-red-100 text-red-800',
      'Education': 'bg-green-100 text-green-800',
      'Life Skills': 'bg-yellow-100 text-yellow-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[category] || 'bg-gray-100 text-gray-800'}`;
  };

  const getEffectivenessColor = (effectiveness) => {
    if (effectiveness >= 80) return 'text-green-600';
    if (effectiveness >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Active': FaPlay,
      'Scheduled': FaClock,
      'Completed': FaCheckCircle,
      'Cancelled': FaTimesCircle,
      'On Hold': FaPause
    };
    
    const IconComponent = icons[status] || FaClock;
    return <IconComponent className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <WardenLayout title="Rehabilitation Programs" subtitle="Manage inmate rehabilitation and education programs">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </WardenLayout>
    );
  }

  return (
    <WardenLayout title="Rehabilitation Programs" subtitle="Manage inmate rehabilitation and education programs">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Behavioral">Behavioral</option>
              <option value="Vocational">Vocational</option>
              <option value="Addiction">Addiction</option>
              <option value="Education">Education</option>
              <option value="Life Skills">Life Skills</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <FaPlus className="mr-2" />
            New Program
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaHeartbeat className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Programs</p>
                <p className="text-2xl font-bold text-gray-900">{programs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaPlay className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Programs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {programs.filter(p => p.status === 'Active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaUsers className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Enrolled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {programs.reduce((sum, p) => sum + p.enrolled, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaGraduationCap className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {programs.reduce((sum, p) => sum + p.completed, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Programs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Rehabilitation Programs ({filteredPrograms.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor & Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrograms.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{program.name}</div>
                        <div className="text-sm text-gray-500">{program.description}</div>
                        <div className="mt-1">
                          <span className={getCategoryColor(program.category)}>
                            {program.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{program.instructor}</div>
                      <div className="text-sm text-gray-500">{program.schedule}</div>
                      <div className="text-sm text-gray-500">{program.location}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <FaCalendarAlt className="mr-1" />
                        {program.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {program.enrolled} / {program.capacity}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(program.enrolled / program.capacity) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round((program.enrolled / program.capacity) * 100)}% capacity
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Completion: {program.completionRate}%
                      </div>
                      <div className={`text-sm font-medium ${getEffectivenessColor(program.effectiveness)}`}>
                        Effectiveness: {program.effectiveness}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {program.completed} graduates
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(program.status)}
                        <span className={getStatusBadge(program.status)}>
                          {program.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <FaEdit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPrograms.length === 0 && (
            <div className="text-center py-12">
              <FaHeartbeat className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No programs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </WardenLayout>
  );
};

export default RehabilitationPrograms;
