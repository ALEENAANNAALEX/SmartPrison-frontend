import React, { useEffect, useMemo, useState } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import {
  FaFileAlt,
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaUser,
  FaArrowLeft
} from 'react-icons/fa';

// Simple helper to read token
const authHeader = () => ({ Authorization: `Bearer ${sessionStorage.getItem('token')}` });

// Select options
const REPORT_TYPES = [
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'neutral', label: 'Neutral' }
];

const CATEGORIES = [
  { value: 'discipline', label: 'Discipline' },
  { value: 'cooperation', label: 'Cooperation' },
  { value: 'aggression', label: 'Aggression' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'work_performance', label: 'Work Performance' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' }
];

const SEVERITIES = [
  { value: 'minor', label: 'Minor' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'major', label: 'Major' },
  { value: 'critical', label: 'Critical' }
];

const DISCIPLINARY_ACTIONS = [
  { value: 'none', label: 'None' },
  { value: 'warning', label: 'Warning' },
  { value: 'privilege_loss', label: 'Privilege Loss' },
  { value: 'solitary_confinement', label: 'Solitary Confinement' },
  { value: 'work_restriction', label: 'Work Restriction' },
  { value: 'other', label: 'Other' }
];

const initialForm = {
  reportType: 'neutral',
  category: '',
  severity: 'minor',
  title: '',
  description: '',
  incidentDate: '',
  location: '',
  witnessesPresent: '', // comma-separated for UI
  actionTaken: '',
  disciplinaryAction: 'none'
};

const ReportsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reports, setReports] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [editing, setEditing] = useState(null); // report being edited
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);

  // Inline panel state (replaces modal)
  const [showInline, setShowInline] = useState(false);
  const [inlineMode, setInlineMode] = useState('create'); // 'create' | 'edit' | 'view'
  const [selected, setSelected] = useState(null); // selected report for view/edit

  // helpers
  const notify = (type, message, timeout = 4000) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), timeout);
  };

  // Load reports only
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const rRes = await fetch('http://localhost:5000/api/warden/reports/behavioral?page=1&limit=50', { headers: authHeader() });
        if (rRes.ok) {
          const rd = await rRes.json();
          setReports(rd.reports || []);
        } else {
          setReports([]);
        }
      } catch (e) {
        console.error('Load error', e);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // Real-time validation (no prisoner, no follow-up)
  const validate = (draft) => {
    const e = {};
    if (!draft.reportType) e.reportType = 'Report type is required';
    if (!draft.category) e.category = 'Category is required';
    if (!draft.title || draft.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (!draft.description || draft.description.trim().length < 10) e.description = 'Description must be at least 10 characters';
    if (!draft.incidentDate) e.incidentDate = 'Incident date is required';
    else {
      const d = new Date(draft.incidentDate);
      if (isNaN(d.getTime())) e.incidentDate = 'Invalid date';
      else if (d > new Date()) e.incidentDate = 'Incident date cannot be in the future';
    }
    return e;
  };

  const isValid = useMemo(() => Object.keys(validate(form)).length === 0, [form]);

  const openCreate = () => {
    setEditing(null);
    setSelected(null);
    setForm(initialForm);
    setErrors({});
    setInlineMode('create');
    setShowInline(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setSelected(r);
    setForm({
      reportType: r.reportType || 'neutral',
      category: r.category || '',
      severity: r.severity || 'minor',
      title: r.title || '',
      description: r.description || '',
      incidentDate: r.incidentDate ? new Date(r.incidentDate).toISOString().slice(0, 10) : '',
      location: r.location || '',
      witnessesPresent: (Array.isArray(r.witnessesPresent) ? r.witnessesPresent : []).join(', '),
      actionTaken: r.actionTaken || '',
      disciplinaryAction: r.disciplinaryAction || 'none'
    });
    setErrors({});
    setInlineMode('edit');
    setShowInline(true);
  };

  const closeInline = () => {
    setShowInline(false);
    setEditing(null);
    setSelected(null);
    setForm(initialForm);
    setErrors({});
  };

  const openView = (r) => {
    setSelected(r);
    setEditing(null);
    setInlineMode('view');
    setShowInline(true);
  };

  const onChange = (key, value) => {
    const draft = { ...form, [key]: value };
    setForm(draft);
    setErrors(validate(draft));
  };

  const toPayload = (f) => ({
    reportType: f.reportType,
    category: f.category,
    severity: f.severity,
    title: f.title.trim(),
    description: f.description.trim(),
    incidentDate: f.incidentDate,
    location: f.location.trim() || undefined,
    witnessesPresent: f.witnessesPresent
      ? f.witnessesPresent.split(',').map(s => s.trim()).filter(Boolean)
      : [],
    actionTaken: f.actionTaken.trim() || undefined,
    disciplinaryAction: f.disciplinaryAction
  });

  const reloadReports = async () => {
    try {
      const rRes = await fetch('http://localhost:5000/api/warden/reports/behavioral?page=1&limit=50', { headers: authHeader() });
      if (rRes.ok) {
        const rd = await rRes.json();
        setReports(rd.reports || []);
      }
    } catch (e) { /* ignore */ }
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    try {
      const payload = toPayload(form);
      const url = editing
        ? `http://localhost:5000/api/warden/reports/behavioral/${editing._id || editing.id}`
        : 'http://localhost:5000/api/warden/reports/behavioral';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        notify('success', editing ? 'Report updated' : 'Report created');
        closeInline();
        await reloadReports();
      } else {
        const txt = await res.text();
        notify('error', `Save failed (${res.status})`);
        console.error('Save failed', txt);
      }
    } catch (err) {
      console.error('Save error', err);
      notify('error', 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async (r) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      const url = `http://localhost:5000/api/warden/reports/behavioral/${r._id || r.id}`;
      const res = await fetch(url, { method: 'DELETE', headers: authHeader() });
      if (res.ok) {
        notify('success', 'Report deleted');
        await reloadReports();
      } else {
        notify('error', `Delete failed (${res.status})`);
      }
    } catch (e) {
      notify('error', 'Network error');
    }
  };

  const filteredReports = (reports || []).filter((r) => {
    const term = searchTerm.trim().toLowerCase();
    const matches = !term
      || r.title?.toLowerCase().includes(term)
      || r.description?.toLowerCase().includes(term)
      || r.category?.toLowerCase().includes(term);
    const status = (r.reviewStatus || 'pending').toLowerCase();
    const statusOk = filterStatus === 'all' || status === filterStatus;
    return matches && statusOk;
  });

  if (loading) {
    return (
      <WardenLayout title="Reports" subtitle="Create and manage behavioral reports">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </WardenLayout>
    );
  }

  return (
    <WardenLayout title="Reports" subtitle="Create and manage behavioral reports">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow ${notification.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
          {notification.message}
        </div>
      )}

      <div className={`space-y-6 ${showInline && inlineMode === 'create' ? 'hidden' : ''}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button onClick={openCreate} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <FaPlus className="mr-2" /> New Report
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Reports ({filteredReports.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prisoner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((r) => (
                  <tr key={r._id || r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{r.title}</div>
                      <div className="text-sm text-gray-500">{r.category} • {r.reportType} • {r.severity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaUser className="mr-2 text-gray-400" />
                        {(r.prisoner?.prisonerNumber || '')} {r.prisoner ? `- ${[r.prisoner.firstName, r.prisoner.lastName].filter(Boolean).join(' ')}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.reviewStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        r.reviewStatus === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        r.reviewStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {r.reviewStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        {r.incidentDate ? new Date(r.incidentDate).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => openView(r)} className="text-indigo-600 hover:text-indigo-900" title="View">
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(r)} className="text-green-600 hover:text-green-900" title="Edit">
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button onClick={() => doDelete(r)} className="text-red-600 hover:text-red-900" title="Delete">
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or create a new report.</p>
            </div>
          )}
        </div>
      </div>

      {/* Inline panel below list (no popup) */}
      {showInline && (
        <div className={`mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${inlineMode === 'create' || inlineMode === 'edit' ? 'w-full max-w-md mx-auto' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={closeInline} className="inline-flex items-center text-indigo-600 hover:underline">
              <FaArrowLeft className="mr-1" /> Back to list
            </button>
            <h3 className="text-lg font-bold text-gray-900">
              {inlineMode === 'view' ? 'Report Details' : editing ? 'Edit Report' : 'New Report'}
            </h3>
          </div>

          {inlineMode === 'view' && selected ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="text-gray-900 font-medium">{selected.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-gray-900 font-medium">{selected.reviewStatus || 'pending'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-gray-900 font-medium">{selected.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type • Severity</p>
                  <p className="text-gray-900 font-medium">{selected.reportType} • {selected.severity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Incident Date</p>
                  <p className="text-gray-900 font-medium">{selected.incidentDate ? new Date(selected.incidentDate).toLocaleDateString() : '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-900 font-medium">{selected.location || '—'}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{selected.description}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Witnesses</p>
                  <p className="text-gray-900">{Array.isArray(selected.witnessesPresent) && selected.witnessesPresent.length ? selected.witnessesPresent.join(', ') : '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Action Taken</p>
                  <p className="text-gray-900">{selected.actionTaken || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Disciplinary Action</p>
                  <p className="text-gray-900">{selected.disciplinaryAction || 'none'}</p>
                </div>

              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {/* Small box layout */}
              <div className="grid grid-cols-1 gap-3 max-w-xl">


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date *</label>
                  <input
                    type="date"
                    value={form.incidentDate}
                    onChange={(e) => onChange('incidentDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.incidentDate ? 'border-red-400' : 'border-gray-300'}`}
                    required
                  />
                  {errors.incidentDate && <p className="text-sm text-red-600 mt-1">{errors.incidentDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
                  <select
                    value={form.reportType}
                    onChange={(e) => onChange('reportType', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.reportType ? 'border-red-400' : 'border-gray-300'}`}
                    required
                  >
                    {REPORT_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => onChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.category ? 'border-red-400' : 'border-gray-300'}`}
                    required
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => onChange('severity', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 border-gray-300"
                  >
                    {SEVERITIES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => onChange('location', e.target.value)}
                    placeholder="e.g., Block A - Yard"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 border-gray-300"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => onChange('title', e.target.value)}
                    placeholder="Enter short title"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
                    required
                  />
                  {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    placeholder="Detailed description..."
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                    required
                  />
                  {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Witnesses (comma-separated)</label>
                  <input
                    type="text"
                    value={form.witnessesPresent}
                    onChange={(e) => onChange('witnessesPresent', e.target.value)}
                    placeholder="e.g., John Doe, Jane Smith"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken</label>
                  <input
                    type="text"
                    value={form.actionTaken}
                    onChange={(e) => onChange('actionTaken', e.target.value)}
                    placeholder="e.g., Warning issued"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disciplinary Action</label>
                  <select
                    value={form.disciplinaryAction}
                    onChange={(e) => onChange('disciplinaryAction', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 border-gray-300"
                  >
                    {DISCIPLINARY_ACTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>


              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={closeInline} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={!isValid || saving} className={`px-4 py-2 rounded-lg text-white ${(!isValid || saving) ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {saving ? 'Saving...' : editing ? 'Update Report' : 'Create Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </WardenLayout>
  );
};

export default ReportsManagement;
