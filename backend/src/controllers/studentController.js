import Student from '../models/Student.js';

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
