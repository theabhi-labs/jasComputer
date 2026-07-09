import Student from '../models/Student.js';
import storageService from '../services/storageService.js';
import axios from 'axios';
import path from 'path';


// ----------------------------------------------
// CREATE – Add a new student
// ----------------------------------------------
export const createStudent = async (req, res) => {
  try {
    const studentData = req.body;

    // Check if student with same email or aadhar already exists
    const existing = await Student.findOne({
      $or: [{ email: studentData.email }, { aadharNo: studentData.aadharNo }],
    });
    if (existing) {
      return res.status(400).json({
        message: 'Student with this email or Aadhar number already exists',
      });
    }

    const student = new Student(studentData);
    await student.save();

    // Populate course details before sending response
    await student.populate('course');

    res.status(201).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error while creating student' });
  }
};

// ----------------------------------------------
// READ ALL – Get all students (with filters)
// ----------------------------------------------
export const getAllStudents = async (req, res) => {
  try {
    // You can add query filters, pagination, sorting here
    const { page = 1, limit = 10, status, course } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (course) filter.course = course;

    const students = await Student.find(filter)
      .populate('course', 'name code') // populate only needed fields
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ message: 'Server error while fetching students' });
  }
};

// ----------------------------------------------
// READ ONE – Get a single student by ID
// ----------------------------------------------
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id).populate('course', 'name code');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error while fetching student' });
  }
};

// ----------------------------------------------
// UPDATE – Update student details
// ----------------------------------------------
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating email or aadhar to duplicates
    if (updates.email || updates.aadharNo) {
      const existing = await Student.findOne({
        _id: { $ne: id },
        $or: [
          { email: updates.email },
          { aadharNo: updates.aadharNo },
        ],
      });
      if (existing) {
        return res.status(400).json({
          message: 'Email or Aadhar already in use by another student',
        });
      }
    }

    const student = await Student.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('course', 'name code');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error while updating student' });
  }
};

// ----------------------------------------------
// DELETE – Remove a student
// ----------------------------------------------
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error while deleting student' });
  }
};

// ----------------------------------------------
// UPLOAD DOCUMENTS (Local)
// ----------------------------------------------
export const uploadStudentDocuments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploadResults = [];
    for (const file of req.files) {
      const objectName = storageService.generateObjectName('documents', studentId, file.originalname);
      const uploadRes = await storageService.uploadToStorage(file.buffer, objectName, file.mimetype);
      
      if (uploadRes.success) {
        uploadResults.push({
          name: file.originalname,
          url: uploadRes.url
        });
      }
    }

    if (uploadResults.length === 0) {
      return res.status(500).json({ success: false, message: 'Failed to upload files to storage' });
    }

    student.documents.push(...uploadResults);
    await student.save();

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during upload' });
  }
};

// ----------------------------------------------
// UPLOAD DOCUMENT BY URL (URL-based)
// ----------------------------------------------
export const uploadStudentDocumentByUrl = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({ success: false, message: 'Document name and URL are required' });
    }

    // Validate URL format
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
    if (!urlRegex.test(url)) {
      return res.status(400).json({ success: false, message: 'Invalid URL format' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Fetch the file from URL
    let response;
    try {
      response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    } catch (fetchErr) {
      return res.status(400).json({ success: false, message: `Failed to fetch file from URL: ${fetchErr.message}` });
    }

    const contentType = response.headers['content-type'];
    const contentLength = parseInt(response.headers['content-length'] || response.data.length);

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({ success: false, message: `Invalid file type: ${contentType}. Allowed: PDF, JPG, PNG` });
    }

    // Validate size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (contentLength > maxSize) {
      return res.status(400).json({ success: false, message: 'File size exceeds maximum limit of 10MB' });
    }

    // Generate filename
    const urlPath = new URL(url).pathname;
    let originalName = path.basename(urlPath);
    if (!originalName || !/\.(pdf|jpg|jpeg|png)$/i.test(originalName)) {
      const extMap = {
        'application/pdf': '.pdf',
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/jpg': '.jpg'
      };
      originalName = `document_${Date.now()}${extMap[contentType] || '.pdf'}`;
    }

    // Upload to storage
    const objectName = storageService.generateObjectName('documents', studentId, originalName);
    const uploadRes = await storageService.uploadToStorage(response.data, objectName, contentType);

    if (!uploadRes.success) {
      return res.status(500).json({ success: false, message: 'Failed to save fetched file to storage' });
    }

    // Save to student documents
    student.documents.push({
      name: name,
      url: uploadRes.url
    });
    await student.save();

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('URL upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during URL upload' });
  }
};

// ----------------------------------------------
// DELETE DOCUMENT
// ----------------------------------------------
export const deleteStudentDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const docIndex = student.documents.findIndex(d => d._id.toString() === docId);
    if (docIndex === -1) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const document = student.documents[docIndex];
    
    // Attempt to delete from storage if it is a local upload path
    if (document.url && document.url.startsWith('/uploads/')) {
      const objectName = document.url.replace('/uploads/', '');
      await storageService.deleteFromStorage(objectName);
    }

    student.documents.splice(docIndex, 1);
    await student.save();

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during document deletion' });
  }
};

