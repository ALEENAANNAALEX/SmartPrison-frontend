import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import {
  FaUsers,
  FaSearch,
  FaIdCard,
  FaMapMarkerAlt,
  FaUserCheck,
  FaUserAltSlash,
  FaExclamationTriangle
} from 'react-icons/fa';

const StaffInmatesView = () => {
  const [inmates, setInmates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('');
  const [filterSecurity, setFilterSecurity] = useState('');
  const [filterCharge, setFilterCharge] = useState('all');

  useEffect(() => {
    fetchBlocks();
    fetchInmates();
  }, []);

  useEffect(() => {
    // Refetch inmates when block changes
    fetchInmates(filterBlock);
  }, [filterBlock]);

  const [blocks, setBlocks] = useState([]);

  const fetchInmates = async (block = '') => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const qs = block ? `?block=${encodeURIComponent(block)}` : '';
      const res = await fetch(`http://localhost:5000/api/staff/inmates${qs}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.inmates)) {
          const normalizeBlockCode = (code) => {
            if (!code) return '';
            const text = String(code).toUpperCase();
            // Accept formats like 'BLOCK-A', 'BLK-A', 'A', 'Block A', 'ADEL'
            const letterMatch = text.match(/^([A-Z])/);
            return letterMatch ? letterMatch[1] : text;
          };

          const mapped = data.inmates.map((p, idx) => ({
            id: p._id || p.id || idx,
            inmateId: p.prisonerNumber || p.inmateId || p.prisonerId || 'N/A',
            name: p.fullName || [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || p.name || 'Unknown',
            age: p.age ?? '',
            gender: (p.gender || '').toString().replace(/^./, c => c.toUpperCase()),
            photoUrl: p.photograph ? (p.photograph.startsWith('http') ? p.photograph : `http://localhost:5000${p.photograph}`) : '',
            // Normalize block data for reliable filtering/display
            blockCode: normalizeBlockCode(p.currentBlock?.blockCode || p.blockCode || p.block || ''),
            blockLabel: p.currentBlock?.name 
              || (p.currentBlock?.blockCode ? `Block ${normalizeBlockCode(p.currentBlock.blockCode)}` 
              : (p.blockName || 'Unknown Block')),
            cell: p.cellNumber || p.currentCell || '—',
            status: (p.status || 'active').toString().replace(/^./, c => c.toUpperCase()),
            crime: Array.isArray(p.charges) ? (p.charges[0]?.charge || '') : (p.crime || p.offense || p.charges || ''),
            sentence: p.sentence || (p.sentenceDetails?.sentenceLength ? `${p.sentenceDetails.sentenceLength} months` : ''),
            admissionDate: p.admissionDate || p.sentenceDetails?.startDate || p.admittedAt || '',
            releaseDate: p.sentenceDetails?.expectedReleaseDate || p.releaseDate || '',
            healthStatus: p.medicalInfo?.chronicConditions?.length > 0 ? 'Under Treatment' : 'Healthy',
            nationality: p.nationality || 'Indian',
            emergencyContact: p.emergencyContact || p.emergencyContacts?.[0] || {},
            securityLevel: p.securityLevel || p.behaviorRecord?.currentLevel || 'Medium'
          }));
          setInmates(mapped);

          // Merge block codes from API blocks and from inmates, de-duplicate
          const existingCodes = new Set((blocks || []).map(b => b.code).filter(Boolean));
          const newCodes = new Set(mapped.map(m => m.blockCode).filter(Boolean));
          const union = new Set([...existingCodes, ...newCodes]);
          if (union.size > 0) {
            const merged = Array.from(union).sort().map(c => ({ code: c, label: `BLOCK-${c}` }));
            setBlocks(merged);
          }
        } else {
          setInmates([]);
        }
      } else {
        console.error('Failed to fetch inmates');
        setInmates([]);
      }
    } catch (error) {
      console.error('Error fetching inmates:', error);
      setInmates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/staff/blocks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const mapped = (data.blocks || []).map(b => {
            const raw = (b.code || b.blockCode || b.label || b.name || '').toString();
            const letter = raw.toUpperCase().match(/^([A-Z])/)?.[1] || '';
            return { code: letter, label: b.label || b.name || (letter ? `BLOCK-${letter}` : '') };
          }).filter(b => b.code);
          // De-duplicate by code
          const uniq = Array.from(new Map(mapped.map(x => [x.code, { code: x.code, label: `BLOCK-${x.code}` }])).values())
            .sort((a, b) => a.code.localeCompare(b.code));
          setBlocks(uniq);
        }
      }
    } catch (err) {
      console.error('Error fetching blocks:', err);
    }
  };

  const filteredInmates = inmates.filter(inmate => {
    const matchesSearch = inmate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inmate.inmateId.toLowerCase().includes(searchTerm.toLowerCase());
    // Block filter strictly uses single-letter code from dropdown
    const selCode = (filterBlock || '').toString().toUpperCase().match(/^([A-Z])/)?.[1] || '';
    const matchesBlock = !selCode || inmate.blockCode === selCode;
    const matchesSecurity = !filterSecurity || inmate.securityLevel.toLowerCase() === filterSecurity.toLowerCase();
    const matchesCharge = filterCharge === 'all' || inmate.crime.toLowerCase().includes(filterCharge.toLowerCase());
    return matchesSearch && matchesBlock && matchesSecurity && matchesCharge;
  });

  // Dashboard-style summary metrics (mirrors warden look & feel)
  const totalInmates = inmates.length;
  const activeInmates = inmates.filter(i => (i.status || '').toLowerCase() === 'active').length;
  const isolationInmates = inmates.filter(i =>
    (i.status || '').toLowerCase() === 'isolation' || (i.blockLabel || '').toUpperCase().includes('ISOLATION')
  ).length;
  const medicalAttention = inmates.filter(i => {
    const chronic = Array.isArray(i?.medicalInfo?.chronicConditions) ? i.medicalInfo.chronicConditions.length > 0 : false;
    const health = (i.healthStatus || '').toLowerCase();
    return chronic || ['under treatment', 'needs attention', 'critical'].some(k => health.includes(k));
  }).length;

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
      case 'inactive':
        return 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
      case 'released':
        return 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800';
      default:
        return 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
    }
  };

  return (
    <StaffLayout title="Inmates Management" subtitle="Manage and monitor all inmates">
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search inmates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Blocks</option>
            {blocks.map(b => (
              <option key={b.code} value={b.code}>{b.label || `BLOCK-${b.code}`}</option>
            ))}
          </select>
          
          <select
            value={filterSecurity}
            onChange={(e) => setFilterSecurity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Security Levels</option>
            <option value="minimum">Minimum</option>
            <option value="medium">Medium</option>
            <option value="maximum">Maximum</option>
            <option value="supermax">Supermax</option>
          </select>
          
          <select
            value={filterCharge}
            onChange={(e) => setFilterCharge(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Charges</option>
            <option value="theft">Theft</option>
            <option value="fraud">Fraud</option>
            <option value="assault">Assault</option>
            <option value="murder">Murder</option>
            <option value="drug">Drug Related</option>
            <option value="robbery">Robbery</option>
            <option value="burglary">Burglary</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredInmates.length} of {inmates.length} inmates
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <FaUsers />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Inmates</p>
              <p className="text-2xl font-semibold text-gray-900">{totalInmates}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4">
            <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <FaUserCheck />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-semibold text-gray-900">{activeInmates}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4">
            <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <FaUserAltSlash />
            </div>
            <div>
              <p className="text-sm text-gray-500">Isolation</p>
              <p className="text-2xl font-semibold text-gray-900">{isolationInmates}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4">
            <div className="h-12 w-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <FaExclamationTriangle />
            </div>
            <div>
              <p className="text-sm text-gray-500">Medical Attention</p>
              <p className="text-2xl font-semibold text-gray-900">{medicalAttention}</p>
            </div>
          </div>
        </div>

        {/* Inmates Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Inmates ({filteredInmates.length})
            </h3>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInmates.map((inmate) => (
              <div key={inmate.id} className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Prisoner No.</p>
                    <p className="text-base font-semibold text-gray-900">{inmate.inmateId}</p>
                  </div>
                  <span className={getStatusBadge(inmate.status)}>{inmate.status}</span>
                </div>

                {/* Body */}
                <div className="p-4 flex items-start gap-4">
                  {/* Photo */}
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                    {inmate.photoUrl ? (
                      <img src={inmate.photoUrl} alt={`${inmate.name} photo`} className="w-full h-full object-cover" />
                    ) : (
                      <FaIdCard className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{inmate.name}</p>
                      <p className="text-gray-500 mt-2">Gender / Age</p>
                      <p className="text-gray-900">{inmate.gender}{inmate.age !== '' ? ` • ${inmate.age}` : ''}</p>
                      <p className="text-gray-500 mt-2">Nationality</p>
                      <p className="text-gray-900">{inmate.nationality || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="text-gray-900 flex items-center"><FaMapMarkerAlt className="mr-1 text-gray-400" /> {inmate.blockLabel}</p>
                      <p className="text-gray-500 mt-2">Cell</p>
                      <p className="text-gray-900">{inmate.cell || '—'}</p>
                      <p className="text-gray-500 mt-2">Health</p>
                      <p className="text-gray-900">{inmate.healthStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Legal & Dates */}
                <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Primary Charge</p>
                    <p className="text-gray-900">{inmate.crime || '—'}</p>
                    <p className="text-gray-500 mt-2">Sentence</p>
                    <p className="text-gray-900">{inmate.sentence || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Admission</p>
                    <p className="text-gray-900">{inmate.admissionDate ? new Date(inmate.admissionDate).toLocaleDateString() : '—'}</p>
                    <p className="text-gray-500 mt-2">Expected Release</p>
                    <p className="text-gray-900">{inmate.releaseDate ? new Date(inmate.releaseDate).toLocaleDateString() : '—'}</p>
                  </div>
                </div>

                {/* Emergency & Medical */}
                <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Emergency Contact</p>
                    <p className="text-gray-900">{inmate.emergencyContact?.name || '—'}{inmate.emergencyContact?.relationship ? `, ${inmate.emergencyContact.relationship}` : ''}</p>
                    <p className="text-gray-900">{inmate.emergencyContact?.phone || ''}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Security Level</p>
                    <p className="text-gray-900">{inmate.securityLevel || '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInmates.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No inmates found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffInmatesView;
