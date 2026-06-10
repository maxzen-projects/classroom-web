const RolePermission = require('../models/RolePermission');

const getSchoolId = (user) => user.school || user.schoolId;

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Admin and super_admin have all permissions
      if (req.user.role === 'admin' || req.user.role === 'super_admin') {
        return next();
      }

      const schoolId = getSchoolId(req.user);
      const rolePermissions = await RolePermission.findOne({
        schoolId,
        role: req.user.role
      });

      // If no permissions found, use defaults
      let permissions = [];
      if (rolePermissions) {
        permissions = rolePermissions.permissions;
      } else {
        // Default permissions based on role
        if (req.user.role === 'teacher') {
          permissions = ['dashboard', 'attendance', 'assignments', 'timetable', 'exams', 'live-classes', 'doubts', 'analytics'];
        } else if (req.user.role === 'student') {
          permissions = ['dashboard', 'attendance', 'assignments', 'fees', 'live-classes', 'performance', 'timetable'];
        }
      }

      if (permissions.includes(requiredPermission)) {
        next();
      } else {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }
    } catch (error) {
      console.error('[PERMISSION] Error checking permissions:', error);
      return res.status(500).json({ message: 'Error checking permissions' });
    }
  };
};

module.exports = checkPermission;
