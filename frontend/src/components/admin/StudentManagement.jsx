// src/pages/StudentManagement.jsx
import React, { useState, useEffect } from 'react';
import { studentService, courseService } from '../../services';
import {
  Card, Button, Input, ConfirmModal, Alert, Loader,
} from '../common';
import {
  FaPlus, FaSearch, FaEdit, FaTrash, FaEye,
  FaUserGraduate, FaCheckCircle, FaRupeeSign,
  FaFileExcel, FaFileCode, FaDownload, FaIdBadge,
  FaFilter, FaTimesCircle
} from 'react-icons/fa';
import AddStudent from './AddStudent';
import EditStudent from './EditStudent';
import StudentDetailsModal from './StudentDetailsModal';
import * as XLSX from 'xlsx';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [pagination.page, filterStatus, filterCourse, searchTerm]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterCourse && { course: filterCourse }),
      };
      const response = await studentService.getAllStudents(params);
      if (response.success) {
        setStudents(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 1,
        }));
        const data = response.data || [];
        setStats({
          total: data.length,
          active: data.filter(s => s.status === 'active').length,
          inactive: data.filter(s => s.status !== 'active').length,
        });
      } else {
        setError(response.message || 'Failed to fetch students');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const response = await courseService.getAllCourses();
      if (response.success) {
        const coursesData = Array.isArray(response.data) ? response.data : [];
        setCourses(coursesData);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await studentService.deleteStudent(selectedStudent._id);
      if (response.success) {
        setSuccess('Student deleted successfully');
        fetchStudents();
        setShowDeleteConfirm(false);
        setSelectedStudent(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to delete student');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete student');
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterCourse('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const response = await studentService.getAllStudents({ limit: 10000 });
      if (!response.success) {
        setError('Export failed: could not fetch students');
        setExporting(false);
        setShowExportMenu(false);
        return;
      }

      const data = response.data || [];
      if (data.length === 0) {
        setError('No students to export');
        setExporting(false);
        setShowExportMenu(false);
        return;
      }

      const excelData = data.map((s, idx) => ({
        'S.No': idx + 1,
        'Enrollment No': s.enrollmentNumber || s.enrollmentNo || 'N/A',
        'Name': s.name || '',
        'Email': s.email || '',
        'Mobile': s.mobile || s.phone || '',
        "Father's Name": s.fatherName || '',
        "Mother's Name": s.motherName || '',
        'Course': s.course?.name || s.courseName || 'N/A',
        'Status': s.status ? s.status.toUpperCase() : 'N/A',
        'Admission Date': s.admissionDate
          ? new Date(s.admissionDate).toLocaleDateString('en-IN')
          : (s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : 'N/A'),
        'Aadhar No': s.aadharNo || 'N/A',
        'City': s.address?.city || s.city || 'N/A',
        'State': s.address?.state || s.state || 'N/A',
        'Pincode': s.address?.pincode || s.pincode || 'N/A',
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);

      const colWidths = Object.keys(excelData[0]).map((key) => {
        const maxContentLen = excelData.reduce((max, row) => {
          const len = String(row[key] ?? '').length;
          return len > max ? len : max;
        }, key.length);
        return { wch: Math.min(Math.max(maxContentLen + 3, 10), 40) };
      });
      ws['!cols'] = colWidths;
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };

      const headerKeys = Object.keys(excelData[0]);
      headerKeys.forEach((_, colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
        if (ws[cellRef]) {
          ws[cellRef].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '1F2937' } },
            alignment: { horizontal: 'center', vertical: 'center' },
          };
        }
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Students');

      const summaryData = [
        { Metric: 'Total Students', Value: data.length },
        { Metric: 'Active', Value: data.filter(s => s.status === 'active').length },
        { Metric: 'Inactive', Value: data.filter(s => s.status !== 'active').length },
        { Metric: 'Exported On', Value: new Date().toLocaleString('en-IN') },
      ];
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      summaryWs['!cols'] = [{ wch: 20 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

      const fileName = `students_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName, { cellStyles: true });

      setSuccess(`Exported ${data.length} students successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Excel export error:', err);
      setError('Export failed: ' + (err.message || 'Unknown error'));
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  const exportToJSON = async () => {
    setExporting(true);
    try {
      const response = await studentService.getAllStudents({ limit: 10000 });
      if (response.success) {
        const data = response.data || [];
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setSuccess(`Exported ${data.length} students as JSON`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('JSON export failed');
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
      inactive: 'bg-slate-50 text-slate-600 border border-slate-200',
      suspended: 'bg-amber-50 text-amber-700 border border-amber-200',
      graduated: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      dropped: 'bg-rose-50 text-rose-700 border border-rose-200',
    };
    return colors[status?.toLowerCase()] || 'bg-slate-50 text-slate-600 border border-slate-200';
  };

  if (loading && students.length === 0) return <Loader />;

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen">
      {/* Header & Title Layout */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Hub</h1>
          <p className="text-sm text-slate-500 mt-1">Manage admissions, configurations, and exports seamlessly.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowAddModal(true)} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm shadow-indigo-600/10 transition-all duration-200 flex items-center px-4 py-2.5 rounded-xl text-sm"
          >
            <FaPlus className="mr-2 text-xs" /> Add Student
          </Button>
          
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting}
              className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm"
            >
              <FaDownload className="text-slate-400 text-xs" /> {exporting ? 'Exporting...' : 'Export Data'}
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={exportToExcel}
                  disabled={exporting}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  <FaFileExcel className="text-emerald-600 text-base" /> Excel Document (.xlsx)
                </button>
                <button
                  onClick={exportToJSON}
                  disabled={exporting}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  <FaFileCode className="text-blue-600 text-base" /> Raw Object Structure (JSON)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Dashboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Enrollment</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600">
            <FaUserGraduate className="text-2xl" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Cohort</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{stats.active}</p>
          </div>
          <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
            <FaCheckCircle className="text-2xl" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inactive Base</p>
            <p className="text-3xl font-black text-slate-500 mt-1">{stats.inactive}</p>
          </div>
          <div className="p-3.5 bg-slate-100 rounded-xl text-slate-600">
            <FaRupeeSign className="text-2xl" />
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6 rounded-xl" />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-6 rounded-xl" />}

      {/* Smart Control Filter Section */}
      <Card className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <FaFilter className="text-indigo-500 text-xs" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Search Filters</h2>
        </div>
        
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[260px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Direct Query</label>
            <Input
              placeholder="Search ID, name, email, contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-slate-50 border-slate-200 rounded-xl focus:bg-white text-sm"
            />
          </div>
          
          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Registration Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 text-slate-700 text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="graduated">Graduated</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <div className="min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Course Stream {coursesLoading && <span className="text-xs text-slate-400 italic">(Syncing...)</span>}
            </label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full bg-slate-50 text-slate-700 text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="">All Streams</option>
              {Array.isArray(courses) && courses.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button onClick={handleSearch} className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm">
              <FaSearch className="mr-2 text-xs opacity-70" /> Query
            </Button>
            {(searchTerm || filterStatus || filterCourse) && (
              <Button variant="secondary" onClick={clearFilters} className="border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl px-4 py-2.5 transition-all text-sm flex items-center">
                <FaTimesCircle className="mr-1.5 text-xs text-slate-400" /> Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Advanced Data Table Matrix */}
      <Card className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><FaIdBadge className="text-slate-400" /> System Reg No</span>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Communication Channel</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Stream</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">State Matrix</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-400 text-sm font-medium">
                    No matching records available inside current dataset view.
                  </td>
                </tr>
              ) : (
                students.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600 tracking-wide">
                      {s.enrollment || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{s.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{s.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{s.course?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide inline-block shadow-sm ${getStatusColor(s.status)}`}>
                        {s.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1 bg-slate-100/60 p-1 rounded-xl group-hover:bg-slate-100 transition-colors">
                        <button
                          onClick={() => { setSelectedStudent(s); setShowDetailsModal(true); }}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                          title="View Data Profile"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button
                          onClick={() => { setSelectedStudent(s); setShowEditModal(true); }}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-white rounded-lg transition-all"
                          title="Modify Record"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => { setSelectedStudent(s); setShowDeleteConfirm(true); }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
                          title="Purge Record"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Unified Pagination Component Layout */}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500">
              Showing <span className="font-bold text-slate-700">{students.length}</span> of <span className="font-bold text-slate-700">{pagination.total}</span> index logs
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all shadow-sm"
              >
                Previous
              </Button>
              <span className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100/80 font-bold rounded-lg border border-slate-200/40">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all shadow-sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Control Modal Anchors */}
      <AddStudent
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { fetchStudents(); setShowAddModal(false); }}
      />
      <EditStudent
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedStudent(null); }}
        onSuccess={() => { fetchStudents(); setShowEditModal(false); }}
        student={selectedStudent}
        courses={courses}
      />
      <StudentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedStudent(null); }}
        student={selectedStudent}
        onDocumentsUpdated={fetchStudents}
      />
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedStudent(null); }}
        onConfirm={handleDelete}
        title="Delete Student Profile"
        message={`Delete ${selectedStudent?.name}? This action cannot be undone.`}
        confirmText="Delete Profile"
        confirmVariant="danger"
      />
    </div>
  );
};

export default StudentManagement;