import mongoose from 'mongoose';

// ---------- Counter Schema (for atomic sequence generation) ----------
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "JAS0926"
  sequence: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

// ---------- Student Schema ----------
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true,
      maxlength: [100, "Father's name cannot exceed 100 characters"],
    },
    motherName: {
      type: String,
      required: [true, "Mother's name is required"],
      trim: true,
      maxlength: [100, "Mother's name cannot exceed 100 characters"],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'],
    },
    alternateMobile: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit alternate mobile number'],
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode'],
    },
    photo: {
      type: String,
      default: '',
    },
    aadharNo: {
      type: String,
      required: [true, 'Aadhar number is required'],
      unique: true,
      match: [/^[0-9]{12}$/, 'Please enter a valid 12-digit Aadhar number'],
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'graduated', 'dropped'],
      default: 'active',
    },
    // ----- Documents -----
    documents: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // ----- Auto‑generated enrollment (format: JASMMYYNNN) -----
    enrollment: {
      type: String,
      unique: true,
      sparse: true, // ensures uniqueness but allows missing values (set on creation)
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
studentSchema.index({ email: 1, aadharNo: 1 });
studentSchema.index({ enrollment: 1 });

// ---------- Pre‑save hook to generate enrollment ----------
studentSchema.pre('save', async function (next) {
  // Only generate if this is a new document and enrollment is not already set
  if (this.isNew && !this.enrollment) {
    try {
      // Use admissionDate or fallback to current date
      const date = this.admissionDate || new Date();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      const prefix = `JAS${month}${year}`; // e.g. "JAS0926"

      // Atomically increment the sequence for this prefix
      const counter = await Counter.findByIdAndUpdate(
        prefix,
        { $inc: { sequence: 1 } },
        { new: true, upsert: true } // create if missing
      );

      const seq = String(counter.sequence).padStart(3, '0');
      this.enrollment = `${prefix}${seq}`; // e.g. "JAS0926001"
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);
export default Student;