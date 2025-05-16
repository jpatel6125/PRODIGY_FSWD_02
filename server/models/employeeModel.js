import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    employeeType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
      default: 'Full-time'
    },
    department: {
      type: String,
      default: ''
    },
    position: {
      type: String,
      default: ''
    },
    joinDate: {
      type: Date,
      default: Date.now
    },
    salary: {
      type: Number,
      default: 0
    },
    profilePicture: {
      type: String,
      default: 'default-profile.jpg'
    },
    address: {
      street: {
        type: String,
        default: ''
      },
      city: {
        type: String,
        default: ''
      },
      state: {
        type: String,
        default: ''
      },
      zipCode: {
        type: String,
        default: ''
      },
      country: {
        type: String,
        default: 'India'
      }
    },
    skills: [{
      type: String,
      trim: true
    }],
    education: [{
      degree: String,
      institution: String,
      year: Number
    }],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Create index for search functionality
employeeSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  email: 'text',
  department: 'text',
  position: 'text' 
});

// Virtual for employee's full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
