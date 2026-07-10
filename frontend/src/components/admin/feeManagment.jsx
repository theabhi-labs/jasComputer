// src/pages/FeeManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  FaRupeeSign, FaWallet, FaSearch, FaEye,
  FaPrint, FaTimes, FaClock, FaReceipt, FaPlus
} from 'react-icons/fa';

import feeService from '../../services/feeService';
import studentService from '../../services/studentService';
import courseService from '../../services/courseService';

import { Card, Button, Input, Alert, Loader, Modal } from '../common';

const FeeManagement = () => {
  // ==================== STATE ====================
  const [stats, setStats] = useState({
    totalCollection: 0,
    todayCollection: 0,
    outstandingCount: 0,
  });

  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableRefreshing, setTableRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  // Selected student details
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSummary, setStudentSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    remark: '',
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Add Fee modal
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [addFeeForm, setAddFeeForm] = useState({
    student: '',
    course: '',
    registrationFee: '',
    courseFee: '',
    discount: '',
  });
  const [submittingFee, setSubmittingFee] = useState(false);

  const isFirstRender = useRef(true);

  // ==================== FETCH FUNCTIONS ====================

  const fetchCourses = async () => {
    try {
      const res = await courseService.getAllCourses();
      if (res.success) setCourses(res.data?.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await studentService.getAllStudents({ limit: 1000 });
      if (res.success) setStudents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  const fetchFees = async (silent = false) => {
    if (silent) setTableRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filterCourse && { course: filterCourse }),
        ...(filterStatus && { status: filterStatus }),
      };
      const res = await feeService.getAllFees(params);
      if (res.success) {
        setFees(res.data || []);
        setPagination(prev => ({
          ...prev,
          total: res.pagination?.total || 0,
          pages: res.pagination?.pages || 1,
        }));
      } else {
        setError(res.message || 'Failed to fetch fees');
      }
    } catch (err) {
      console.error('Fetch fees error:', err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
      setTableRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await feeService.getAllFees({ limit: 1000 });
      if (res.success) {
        const all = res.data || [];
        const total = all.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
        const today = all
          .filter(f => {
            const d = new Date(f.updatedAt);
            const now = new Date();
            return d.getDate() === now.getDate() &&
                   d.getMonth() === now.getMonth() &&
                   d.getFullYear() === now.getFullYear();
          })
          .reduce((sum, f) => sum + (f.paidAmount || 0), 0);
        const outstanding = all.filter(f => f.status === 'pending' || f.status === 'partial').length;
        setStats({ totalCollection: total, todayCollection: today, outstandingCount: outstanding });
      }
    } catch (err) {
      console.error('Stats error', err);
    }
  };

  // ─── ✅ FIXED: fetchStudentDetails – only transactions, compute summary from them ───
  const fetchStudentDetails = async (studentId) => {
    if (!studentId) return;
    setLoadingSummary(true);
    try {
      // 1. Fetch transactions only
      const transRes = await feeService.getStudentTransactions(studentId);
      let transactionList = [];
      if (transRes.success) {
        transactionList = Array.isArray(transRes.data) ? transRes.data : [];
      } else {
        console.warn('Transactions fetch failed:', transRes.message);
      }
      setTransactions(transactionList);

      // 2. Compute summary from transactions
      // Since each transaction has 'fee' object with totalFee, paidAmount, remainingAmount, status
      // We can use the first transaction's fee details or aggregate.
      // Better: use the latest transaction's fee summary, or compute from all.
      // Simplest: take the first transaction's fee object (assuming all transactions belong to same fee)
      if (transactionList.length > 0) {
        const firstTx = transactionList[0];
        if (firstTx.fee) {
          setStudentSummary({
            totalFee: firstTx.fee.totalFee || 0,
            paidAmount: firstTx.fee.paidAmount || 0,
            remaining: firstTx.fee.remainingAmount || 0,
            status: firstTx.fee.status || 'pending',
          });
        } else {
          // Fallback: compute from transactions
          const totalPaid = transactionList.reduce((sum, t) => sum + (t.amount || 0), 0);
          // We don't know totalFee from transactions alone, so set placeholder
          setStudentSummary({
            totalFee: 0,
            paidAmount: totalPaid,
            remaining: 0,
            status: 'partial',
          });
        }
      } else {
        // No transactions
        setStudentSummary({
          totalFee: 0,
          paidAmount: 0,
          remaining: 0,
          status: 'pending',
        });
      }
    } catch (err) {
      console.error('Failed to fetch student transactions', err);
      setTransactions([]);
      setStudentSummary({
        totalFee: 0,
        paidAmount: 0,
        remaining: 0,
        status: 'pending',
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchCourses();
    fetchStats();
    fetchFees(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPagination(prev => (prev.page === 1 ? prev : { ...prev, page: 1 }));
    }, 450);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchFees(true);
  }, [pagination.page, filterCourse, filterStatus, searchTerm]);

  // ==================== HANDLERS ====================

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setFilterCourse('');
    setFilterStatus('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    fetchStudentDetails(student._id);
  };

  const handleRowClick = (fee) => {
    if (fee.student) {
      handleSelectStudent(fee.student);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  // ==================== PAYMENT HANDLER ====================
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSubmittingPayment(true);
    try {
      // 1. Find the fee record for this student
      const feeRes = await feeService.getAllFees({ student: selectedStudent._id, limit: 1 });
      const fee = feeRes.data?.[0];
      if (!fee) throw new Error('No fee record found for this student');

      // 2. Map payment method to backend enum
      const paymentMethodMap = {
        cash: 'Cash',
        upi: 'UPI',
        bank_transfer: 'Bank Transfer',
        cheque: 'Cheque',
        card: 'Card',
        online: 'Online',
        other: 'Other',
      };
      const mappedPaymentMode = paymentMethodMap[paymentForm.paymentMethod] || 'Cash';

      // 3. Create transaction using POST /transactions
      const payload = {
        fee: fee._id,
        student: selectedStudent._id,
        amount: parseFloat(paymentForm.amount),
        paymentMode: mappedPaymentMode,
        paymentDate: paymentForm.paymentDate || new Date().toISOString().split('T')[0],
        remark: paymentForm.remark || '',
      };

      const res = await feeService.createTransaction(payload);
      if (res.success) {
        // 4. Refresh all data
        fetchFees(true);
        fetchStats();
        // Force refresh student details (including transactions)
        await fetchStudentDetails(selectedStudent._id);
        setShowPaymentModal(false);
        setPaymentForm({
          amount: '',
          paymentMethod: 'cash',
          paymentDate: new Date().toISOString().split('T')[0],
          remark: '',
        });
      } else {
        throw new Error(res.message || 'Payment failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingPayment(false);
    }
  };

  // ==================== ADD FEE HANDLERS ====================

  const handleAddFeeChange = (e) => {
    const { name, value } = e.target;
    setAddFeeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFeeSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFee(true);
    try {
      const payload = {
        student: addFeeForm.student,
        course: addFeeForm.course,
        registrationFee: parseFloat(addFeeForm.registrationFee) || 0,
        courseFee: parseFloat(addFeeForm.courseFee) || 0,
        discount: parseFloat(addFeeForm.discount) || 0,
      };
      const res = await feeService.createFee(payload);
      if (res.success) {
        fetchFees(true);
        fetchStats();
        setShowAddFeeModal(false);
        setAddFeeForm({ student: '', course: '', registrationFee: '', courseFee: '', discount: '' });
      } else {
        throw new Error(res.message || 'Failed to create fee');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingFee(false);
    }
  };

  // ==================== RENDER HELPERS ====================

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      partial: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      pending: 'bg-red-500/10 text-red-400 border border-red-500/20',
      overdue: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    };
    return styles[status?.toLowerCase()] || 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatTransactionDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-100 p-4 md:p-6 font-sans">
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />
      )}

      {/* ===== HEADER ===== */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Fee Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track collections, dues aur payments — sab ek jagah</p>
        </div>
        <button
          onClick={() => {
            fetchStudents();
            setShowAddFeeModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6700] hover:bg-[#e65c00] text-white text-sm font-medium transition-colors shadow-lg shadow-[#FF6700]/20"
        >
          <FaPlus size={14} /> Add Fee
        </button>
      </div>

      {/* ===== STATISTICS CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-[#141414] border border-white/5 p-5 group hover:border-[#FF6700]/30 transition-colors duration-300">
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-[#FF6700]/10 blur-2xl group-hover:bg-[#FF6700]/20 transition-all duration-500" />
          <div className="relative flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Total Collection</p>
              <p className="text-2xl font-bold text-white mt-2 tabular-nums">{formatCurrency(stats.totalCollection)}</p>
              <span className="text-xs text-gray-600 mt-1 inline-block">All Time</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FF6700]/10">
              <FaWallet className="text-lg text-[#FF6700]" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[#141414] border border-white/5 p-5 group hover:border-emerald-500/30 transition-colors duration-300">
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
          <div className="relative flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Today's Collection</p>
              <p className="text-2xl font-bold text-white mt-2 tabular-nums">{formatCurrency(stats.todayCollection)}</p>
              <span className="text-xs text-gray-600 mt-1 inline-block">Today</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10">
              <FaRupeeSign className="text-lg text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[#141414] border border-white/5 p-5 group hover:border-red-500/30 transition-colors duration-300">
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-red-500/10 blur-2xl group-hover:bg-red-500/20 transition-all duration-500" />
          <div className="relative flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Outstanding Students</p>
              <p className="text-2xl font-bold text-white mt-2 tabular-nums">{stats.outstandingCount}</p>
              <span className="text-xs text-gray-600 mt-1 inline-block">Need Attention</span>
            </div>
            <div className="p-2.5 rounded-xl bg-red-500/10">
              <FaClock className="text-lg text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== STUDENT DETAILS ===== */}
      {selectedStudent && (
        <div className="mb-6 rounded-2xl bg-[#141414] border border-white/5 p-5 animate-[fadeIn_.2s_ease]">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">{selectedStudent.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1 mt-2 text-sm text-gray-400">
                <p>📞 {selectedStudent.mobile}</p>
                <p>📧 {selectedStudent.email}</p>
                <p>🆔 Enrollment: <span className="font-mono text-white">{selectedStudent.enrollment || 'N/A'}</span></p>
                <p>📚 {selectedStudent.courses?.name || 'N/A'}</p>
                <p>📅 Admission: {selectedStudent.createdAt?.split('T')[0]}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6700] hover:bg-[#e65c00] text-white text-sm font-medium transition-colors"
              >
                <FaPlus size={12} /> Receive Payment
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-colors"
              >
                <FaTimes size={12} /> Close
              </button>
            </div>
          </div>

          {loadingSummary ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : studentSummary && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-black/30 border border-white/5">
              <div>
                <p className="text-xs text-gray-500">Total Fee</p>
                <p className="text-lg font-bold text-white tabular-nums">{formatCurrency(studentSummary.totalFee)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Paid Amount</p>
                <p className="text-lg font-bold text-emerald-400 tabular-nums">{formatCurrency(studentSummary.paidAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Remaining</p>
                <p className="text-lg font-bold text-red-400 tabular-nums">{formatCurrency(studentSummary.remaining)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusBadge(studentSummary.status)}`}>
                  {studentSummary.status?.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* ─── PAYMENT HISTORY TABLE ─── */}
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <FaReceipt className="text-[#FF6700]" /> Payment History
            </h4>
            {loadingSummary ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-gray-600 py-4 text-center">No transactions found.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left font-medium">#</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Amount</th>
                      <th className="px-4 py-3 text-left font-medium">Mode</th>
                      <th className="px-4 py-3 text-left font-medium">Remark</th>
                      <th className="px-4 py-3 text-left font-medium">Received By</th>
                      <th className="px-4 py-3 text-left font-medium">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, idx) => (
                      <tr key={t._id} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-3 text-gray-300">
                          {formatTransactionDate(t.paymentDate || t.createdAt)}
                        </td>
                        <td className="px-4 py-3 font-medium text-white tabular-nums">
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="px-4 py-3 capitalize text-gray-300">
                          {t.paymentMode || t.paymentMethod || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {t.remark || t.notes || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {t.receivedBy?.name || t.receivedBy || 'Admin'}
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-[#FF6700] hover:text-[#ff8533] text-xs flex items-center gap-1 font-medium">
                            <FaPrint size={11} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ALL STUDENTS FEE SUMMARY TABLE ===== */}
      <div className="rounded-2xl bg-[#141414] border border-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-white">All Students Fee Summary</h3>
          <div className="flex flex-wrap gap-2">
            <form onSubmit={handleSearch} className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
              <input
                placeholder="Search by Name, Enrollment, Email, Mobile..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-64 pl-9 pr-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-[#FF6700]/50 focus:ring-1 focus:ring-[#FF6700]/30 transition-colors"
              />
              {tableRefreshing && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#FF6700]/30 border-t-[#FF6700] animate-spin" />
              )}
            </form>
            <select
              value={filterCourse}
              onChange={(e) => {
                setFilterCourse(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm text-gray-200 focus:outline-none focus:border-[#FF6700]/50"
            >
              <option value="">All Courses</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm text-gray-200 focus:outline-none focus:border-[#FF6700]/50"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            {(searchInput || filterCourse || filterStatus) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition-colors"
              >
                <FaTimes size={11} /> Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : fees.length === 0 ? (
          <div className="text-center py-12 text-gray-600 text-sm">No fee records found.</div>
        ) : (
          <>
            <div className={`overflow-x-auto transition-opacity duration-200 ${tableRefreshing ? 'opacity-50' : 'opacity-100'}`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left font-medium">#</th>
                    <th className="px-4 py-3 text-left font-medium">Enrollment No</th>
                    <th className="px-4 py-3 text-left font-medium">Student Name</th>
                    <th className="px-4 py-3 text-left font-medium">Course</th>
                    <th className="px-4 py-3 text-left font-medium">Total Fee</th>
                    <th className="px-4 py-3 text-left font-medium">Remaining</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-center font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee, idx) => (
                    <tr
                      key={fee._id}
                      className="border-t border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                      onClick={() => handleRowClick(fee)}
                    >
                      <td className="px-4 py-3 text-gray-600">{idx + 1 + (pagination.page - 1) * pagination.limit}</td>
                      <td className="px-4 py-3 font-mono text-sm text-[#FF6700]">
                        {fee.student?.enrollment || 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-medium text-white">{fee.student?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-400">{fee.course?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-300 tabular-nums">{formatCurrency(fee.totalAmount)}</td>
                      <td className="px-4 py-3 text-red-400 tabular-nums">{formatCurrency(fee.remainingAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(fee.status)}`}>
                          {fee.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectStudent(fee.student);
                          }}
                          className="text-[#FF6700] hover:text-[#ff8533] font-medium text-xs flex items-center gap-1.5 mx-auto"
                        >
                          <FaEye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.pages > 1 && (
              <div className="flex flex-wrap justify-between items-center gap-3 mt-4 pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500">
                  Showing {fees.length} of {pagination.total}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 text-xs font-medium transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-xs text-gray-400">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    disabled={pagination.page === pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 text-xs font-medium transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== RECEIVE PAYMENT MODAL ===== */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Receive Payment"
        size="md"
      >
        <form onSubmit={handlePaymentSubmit}>
          <div className="space-y-4">
            {selectedStudent && (
              <div className="bg-black/30 border border-white/5 p-3 rounded-xl text-sm text-gray-300">
                <p><span className="font-semibold text-white">Student:</span> {selectedStudent.name}</p>
                <p><span className="font-semibold text-white">Enrollment:</span> {selectedStudent.enrollment || 'N/A'}</p>
                <p><span className="font-semibold text-white">Course:</span> {selectedStudent.course?.name || 'N/A'}</p>
                <p><span className="font-semibold text-white">Remaining:</span> {formatCurrency(studentSummary?.remaining)}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Amount *</label>
              <input
                type="number"
                name="amount"
                value={paymentForm.amount}
                onChange={handlePaymentChange}
                placeholder="Enter amount"
                required
                min="1"
                step="0.01"
                className="w-full px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-gray-200 focus:outline-none focus:border-[#FF6700]/50 focus:ring-1 focus:ring-[#FF6700]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Payment Mode *</label>
              <select
                name="paymentMethod"
                value={paymentForm.paymentMethod}
                onChange={handlePaymentChange}
                className="w-full px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-gray-200 focus:outline-none focus:border-[#FF6700]/50"
                required
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Payment Date</label>
              <input
                type="date"
                name="paymentDate"
                value={paymentForm.paymentDate}
                onChange={handlePaymentChange}
                className="w-full px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-gray-200 focus:outline-none focus:border-[#FF6700]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Remark (optional)</label>
              <input
                name="remark"
                value={paymentForm.remark}
                onChange={handlePaymentChange}
                placeholder="Any notes..."
                className="w-full px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-gray-200 focus:outline-none focus:border-[#FF6700]/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPayment}
              className="px-4 py-2 rounded-xl bg-[#FF6700] hover:bg-[#e65c00] disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {submittingPayment ? 'Processing...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ===== ADD FEE MODAL ===== */}
      <Modal
        isOpen={showAddFeeModal}
        onClose={() => setShowAddFeeModal(false)}
        title="Add Fee for Student"
        size="md"
      >
        <form onSubmit={handleAddFeeSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Student *</label>
              <select
                name="student"
                value={addFeeForm.student}
                onChange={handleAddFeeChange}
                className="w-full px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-gray-200 focus:outline-none focus:border-[#FF6700]/50"
                required
              >
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Course *</label>
              <select
                name="course"
                value={addFeeForm.course}
                onChange={handleAddFeeChange}
                className="w-full px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-gray-200 focus:outline-none focus:border-[#FF6700]/50"
                required
              >
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Registration Fee</label>
              <input
                type="number"
                name="registrationFee"
                value={addFeeForm.registrationFee}
                onChange={handleAddFeeChange}
                placeholder="0"
                className="w-full px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-gray-200 focus:outline-none focus:border-[#FF6700]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Course Fee</label>
              <input
                type="number"
                name="courseFee"
                value={addFeeForm.courseFee}
                onChange={handleAddFeeChange}
                placeholder="0"
                className="w-full px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-gray-200 focus:outline-none focus:border-[#FF6700]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Discount (if any)</label>
              <input
                type="number"
                name="discount"
                value={addFeeForm.discount}
                onChange={handleAddFeeChange}
                placeholder="0"
                className="w-full px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-gray-200 focus:outline-none focus:border-[#FF6700]/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowAddFeeModal(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingFee}
              className="px-4 py-2 rounded-xl bg-[#FF6700] hover:bg-[#e65c00] disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {submittingFee ? 'Creating...' : 'Create Fee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeManagement;