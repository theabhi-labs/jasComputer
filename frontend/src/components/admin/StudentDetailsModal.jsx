import React, { useRef, useState, useEffect } from 'react';
import { Modal, Card, Button } from '../common';
import {
  FaUser, FaEnvelope, FaPhone, FaUserTie, FaCalendarAlt,
  FaMapMarkerAlt, FaBookOpen, FaCreditCard,
  FaTint, FaVenusMars, FaEye, FaIdBadge,
  FaCloudUploadAlt, FaFilePdf, FaTrash, FaSpinner,
  FaAddressBook, FaCity, FaFlag, FaQrcode
} from 'react-icons/fa';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { studentService } from '../../services';

const StudentDetailsModal = ({ isOpen, onClose, student, onDocumentsUpdated }) => {
  const printRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [localDocuments, setLocalDocuments] = useState(student?.documents || []);
  const [uploadError, setUploadError] = useState('');

  // Sync documents when student prop changes
  useEffect(() => {
    setLocalDocuments(student?.documents || []);
  }, [student]);

  if (!student) return null;

  // Helper: format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'dd/MM/yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      graduated: 'bg-blue-100 text-blue-800',
      dropped: 'bg-red-100 text-red-800',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // ---------- Document Upload ----------
  const handleFileSelect = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('documents', file));

      const response = await studentService.uploadDocuments(student._id, formData);
      if (response.success) {
        setLocalDocuments(response.data?.documents || []);
        onDocumentsUpdated?.();
      } else {
        setUploadError(response.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Document upload error:', err);
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      const response = await studentService.deleteDocument(student._id, docId);
      if (response.success) {
        setLocalDocuments(prev => prev.filter(d => d._id !== docId));
        onDocumentsUpdated?.();
      }
    } catch (err) {
      console.error('Delete document error:', err);
    }
  };

  const handleViewDocument = (url) => {
    if (url) window.open(url, '_blank');
  };

  // ---------- PDF Export ----------
  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setGeneratingPdf(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const enrollmentNo = student.enrollment || 'student';
      pdf.save(`${enrollmentNo}_profile.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Photo URL (if any)
  const photoUrl = student.photo || '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Profile"
      size="lg"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* ========== PRINTABLE CONTENT ========== */}
        <div ref={printRef} className="space-y-6 bg-white p-6">

          {/* Student Photo & Name */}
          <div className="flex items-center gap-6 border-b pb-4">
            <div className="flex-shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={student.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-300"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {student.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-sm bg-blue-50 px-3 py-1 rounded-full">
                  <FaIdBadge className="text-blue-600" />
                  Enrollment: <span className="font-mono font-semibold">{student.enrollment || 'Not Assigned'}</span>
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(student.status)}`}>
                  {student.status?.toUpperCase() || 'ACTIVE'}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaUser className="text-blue-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Father's Name</p>
                <p className="text-gray-900 font-medium">{student.fatherName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mother's Name</p>
                <p className="text-gray-900 font-medium">{student.motherName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="text-gray-900 capitalize">{student.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="text-gray-900">{formatDate(student.dob)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="text-gray-900">{student.mobile || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Alternate Mobile</p>
                <p className="text-gray-900">{student.alternateMobile || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{student.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Aadhar No.</p>
                <p className="text-gray-900 font-mono">{student.aadharNo || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* Address Information */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-600" />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Full Address</p>
                <p className="text-gray-900">{student.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="text-gray-900">{student.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="text-gray-900">{student.state || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pincode</p>
                <p className="text-gray-900">{student.pincode || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* Course Details */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaBookOpen className="text-blue-600" />
              Course Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Course Name</p>
                <p className="text-gray-900 font-medium">
                  {student.course?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Admission Date</p>
                <p className="text-gray-900">{formatDate(student.admissionDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-gray-900 capitalize">{student.status || 'N/A'}</p>
              </div>
              {/* Optional: if course has duration, show it */}
              {student.course?.duration && (
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-gray-900">{student.course.duration}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Documents Gallery + Upload */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaFilePdf className="text-blue-600" />
                Documents
              </h3>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  onClick={handleFileSelect}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  {uploading ? <FaSpinner className="animate-spin" /> : <FaCloudUploadAlt />}
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </div>
            </div>

            {uploadError && (
              <p className="text-sm text-red-600 mb-3">{uploadError}</p>
            )}

            {(!localDocuments || localDocuments.length === 0) ? (
              <p className="text-sm text-gray-500">No documents uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {localDocuments.map((doc, idx) => (
                  <div key={doc._id || idx} className="border rounded-lg p-3">
                    {doc.url && /\.(jpg|jpeg|png|webp)$/i.test(doc.url) ? (
                      <img
                        src={doc.url}
                        alt={doc.name || 'document'}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <FaFilePdf className="text-3xl text-red-400" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate">{doc.name || `Document ${idx + 1}`}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDocument(doc.url)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    {doc.uploadDate && (
                      <p className="text-xs text-gray-400 mt-1">Uploaded: {formatDate(doc.uploadDate)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        {/* ========== END PRINTABLE CONTENT ========== */}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            className="bg-gray-700 hover:bg-gray-800 flex items-center gap-2"
          >
            {generatingPdf ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
            {generatingPdf ? 'Generating PDF...' : 'Download PDF'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StudentDetailsModal;