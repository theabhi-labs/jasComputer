import React, { useState, useEffect } from 'react';
import { certificateService, studentService, courseService } from '../../services';
import { Card, Button, Input, Modal, ConfirmModal, Alert, Loader } from '../common';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Download, Eye, Trash2, Share2, 
  Award, CheckCircle, XCircle, FileText, Info, 
  Mail, Link 
} from 'lucide-react';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import LoaderJAS from '../common/Loader';

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Share Modal Component
// ─────────────────────────────────────────────────────────────────────────────
const ShareModal = ({ isOpen, onClose, certificateId, studentName, courseName }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const verificationUrl = `${window.location.origin}/verify-certificate/${certificateId}`;
  const encodedUrl = encodeURIComponent(verificationUrl);
  const encodedText = encodeURIComponent(`🎓 I have successfully completed the course "${courseName}"! View my certificate here:`);

  const shareOptions = [
    { name: 'WhatsApp', icon: FaWhatsapp, color: 'bg-green-500 hover:bg-green-600', url: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { name: 'Facebook', icon: FaFacebook, color: 'bg-blue-600 hover:bg-blue-700', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'Twitter', icon: FaTwitter, color: 'bg-sky-500 hover:bg-sky-600', url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { name: 'LinkedIn', icon: FaLinkedin, color: 'bg-blue-700 hover:bg-blue-800', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { name: 'Email', icon: Mail, color: 'bg-gray-600 hover:bg-gray-700', url: `mailto:?subject=My%20Certificate%20of%20Completion&body=${encodedText}%20${encodedUrl}` },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Certificate" size="md">
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Share your achievement with friends and employers. Anyone with this link can verify your certificate.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {shareOptions.map((opt) => (
            <a
              key={opt.name}
              href={opt.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-2 p-3 rounded-xl text-white transition-transform transform hover:scale-105 ${opt.color}`}
              onClick={(e) => {
                if (opt.name === 'Email') return;
                e.stopPropagation();
              }}
            >
              <opt.icon className="w-5 h-5" />
              <span className="text-xs font-semibold">{opt.name}</span>
            </a>
          ))}
          
          <button
            onClick={copyToClipboard}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <Link className="w-5 h-5" />
            <span className="text-xs font-semibold">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
          <p className="text-xs font-mono text-gray-500 break-all">{verificationUrl}</p>
        </div>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const CertificateManagement = () => {
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    type: 'course_completion',
    grade: '',
    percentage: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.enrollmentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [certsRes, studentsRes, coursesRes, statsRes] = await Promise.all([
        certificateService.getAllCertificates(),
        studentService.getAllStudents({ limit: 1000, status: 'active' }),
        courseService.getAllCourses(),
        certificateService.getCertificateStats()
      ]);
      if (certsRes.success) setCertificates(certsRes.data.certificates || []);
      if (studentsRes.success) {
        setStudents(studentsRes.data.students || []);
        setFilteredStudents(studentsRes.data.students || []);
      }
      if (coursesRes.success) setCourses(coursesRes.data.courses || []);
      if (statsRes.success) setStats(statsRes.data);
    } catch (error) {
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.studentId) {
      setError('Please select a student');
      return;
    }
    setLoading(true);
    try {
      const response = await certificateService.generateCertificate(formData);
      if (response.success) {
        setSuccess('Certificate generated successfully!');
        fetchData();
        setShowGenerateModal(false);
        resetForm();
      } else {
        setError(response.message || 'Failed to generate certificate');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    try {
      const response = await certificateService.revokeCertificate(selectedCertificate._id, 'Revoked by admin');
      if (response.success) {
        setSuccess('Certificate revoked successfully!');
        fetchData();
        setShowRevokeConfirm(false);
        setSelectedCertificate(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to revoke certificate');
    }
  };

  const handleDownload = (certificate) => {
    if (certificate.pdfUrl) {
      window.open(certificate.pdfUrl, '_blank');
    } else {
      alert('PDF not available');
    }
  };

  const handleShare = (certificate) => {
    setSelectedCertificate(certificate);
    setShowShareModal(true);
  };

  const resetForm = () => {
    setFormData({ studentId: '', type: 'course_completion', grade: '', percentage: '' });
    setSearchTerm('');
  };

  const getTypeLabel = (type) => {
    const labels = {
      course_completion: 'Course Completion',
      achievement: 'Achievement',
      participation: 'Participation',
      bonafide: 'Bonafide'
    };
    return labels[type] || type;
  };

  if (loading && certificates.length === 0) return <LoaderJAS />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Certificate Management</h1>
          <p className="text-gray-500 mt-1 font-medium">Issue, track and verify academic credentials.</p>
        </div>
        <Button 
          onClick={() => setShowGenerateModal(true)}
          className="shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1"
        >
          <Plus className="w-5 h-5 mr-2" /> Generate New Certificate
        </Button>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Total Issued', value: stats.total, color: 'blue', icon: FileText },
            { label: 'Active', value: stats.issued, color: 'green', icon: CheckCircle },
            { label: 'Revoked', value: stats.revoked, color: 'red', icon: XCircle },
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className={`p-6 rounded-2xl border border-${stat.color}-100 bg-white shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-3xl font-bold text-${stat.color}-600 mt-1`}>{stat.value || 0}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Main Table Card */}
      <Card className="overflow-hidden border-none shadow-xl bg-white/80 backdrop-blur-md rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Student Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Type & Course</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Issue Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {certificates.map((cert) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={cert._id} 
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                          {cert.studentId?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{cert.studentId?.name}</p>
                          <p className="text-xs font-mono text-gray-400">{cert.certificateId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className="font-medium text-gray-800">{getTypeLabel(cert.type)}</p>
                      <p className="text-gray-500">{cert.courseId?.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(cert.issueDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cert.status === 'issued' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cert.status === 'issued' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {cert.status === 'issued' ? 'Issued' : 'Revoked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedCertificate(cert); setShowViewModal(true); }} 
                          className="p-2 hover:bg-white rounded-lg text-blue-600 shadow-sm border border-transparent hover:border-blue-100 transition-all"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDownload(cert)} 
                          className="p-2 hover:bg-white rounded-lg text-green-600 shadow-sm border border-transparent hover:border-green-100 transition-all"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => handleShare(cert)} 
                          className="p-2 hover:bg-white rounded-lg text-purple-600 shadow-sm border border-transparent hover:border-purple-100 transition-all"
                        >
                          <Share2 size={18} />
                        </button>
                        {cert.status === 'issued' && (
                          <button 
                            onClick={() => { setSelectedCertificate(cert); setShowRevokeConfirm(true); }} 
                            className="p-2 hover:bg-white rounded-lg text-red-600 shadow-sm border border-transparent hover:border-red-100 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Generate Modal */}
      <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generate New Credential" size="lg">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find student by name or ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            
            <div className="border rounded-xl overflow-hidden">
              <select
                multiple
                value={[formData.studentId]}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full h-40 px-2 py-2 outline-none text-sm"
                required
              >
                {filteredStudents.map(student => (
                  <option key={student._id} value={student._id} className="p-2 rounded-lg cursor-pointer hover:bg-indigo-50">
                    {student.name} • {student.enrollmentNo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Certificate Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              >
                <option value="course_completion">Course Completion</option>
                <option value="achievement">Achievement</option>
                <option value="participation">Participation</option>
                <option value="bonafide">Bonafide</option>
              </select>
            </div>
            <Input 
              label="Grade" 
              placeholder="e.g. A+" 
              className="rounded-xl"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 bg-gray-50 -mx-6 -mb-6 p-6">
            <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={loading} className="bg-indigo-600">Issue Certificate</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Credential Preview" size="lg">
        {selectedCertificate && (
          <div className="space-y-6">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl relative overflow-hidden">
              <Award className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
              <div className="relative z-10 text-center">
                <p className="uppercase tracking-[0.2em] text-indigo-200 text-xs font-bold mb-2">Official Certificate</p>
                <h3 className="text-3xl font-serif italic mb-4">{selectedCertificate.studentId?.name}</h3>
                <div className="h-px bg-white/20 w-1/2 mx-auto my-4" />
                <p className="text-indigo-100">Has successfully completed the course</p>
                <p className="text-xl font-bold mt-1">{selectedCertificate.courseId?.name}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500">ID Number</p>
                <p className="font-mono font-bold">{selectedCertificate.certificateId}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Status</p>
                <p className={`font-bold ${selectedCertificate.status === 'issued' ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedCertificate.status.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => handleDownload(selectedCertificate)} className="flex-1">
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
              <Button variant="secondary" onClick={() => handleShare(selectedCertificate)} className="flex-1">
                <Share2 className="w-4 h-4 mr-2" /> Share Certificate
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Revoke Modal */}
      <ConfirmModal
        isOpen={showRevokeConfirm}
        onClose={() => setShowRevokeConfirm(false)}
        onConfirm={handleRevoke}
        title="Revoke Credential"
        message="This will permanently invalidate this certificate. The student will no longer be able to verify this document. Proceed?"
        confirmText="Yes, Revoke"
      />

      {/* Share Modal */}
      {selectedCertificate && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedCertificate(null);
          }}
          certificateId={selectedCertificate.certificateId}
          studentName={selectedCertificate.studentId?.name}
          courseName={selectedCertificate.courseId?.name}
        />
      )}
    </div>
  );
};

export default CertificateManagement;