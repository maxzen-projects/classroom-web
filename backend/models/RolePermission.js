const mongoose = require('mongoose');

const rolePermissionSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    required: true
  },
  permissions: [{
    type: String,
    required: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound unique index to ensure one document per school and role
rolePermissionSchema.index({ schoolId: 1, role: 1 }, { unique: true });

// Pre-save middleware to set default permissions if none provided
rolePermissionSchema.pre('save', function(next) {
  if (this.permissions.length === 0) {
    // Set default permissions based on role
    if (this.role === 'teacher') {
      this.permissions = ['dashboard', 'attendance', 'assignments', 'timetable', 'exams', 'live-classes', 'doubts', 'analytics'];
    } else if (this.role === 'student') {
      this.permissions = ['dashboard', 'attendance', 'assignments', 'fees', 'live-classes', 'performance', 'timetable'];
    } else if (this.role === 'admin') {
      // Admin has all permissions
      this.permissions = [
        'dashboard', 'attendance', 'assignments', 'timetable', 'exams', 'live-classes', 
        'doubts', 'analytics', 'fees', 'students', 'teachers', 'classes', 'subjects', 
        'schools', 'reports', 'settings', 'permissions'
      ];
    }
  }
  next();
});

module.exports = mongoose.model('RolePermission', rolePermissionSchema);
