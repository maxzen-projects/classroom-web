const RolePermission = require('../models/RolePermission');
const mongoose = require('mongoose');

const getSchoolId = (user) => user.school || user.schoolId;

const getPermissions = async (req, res) => {
  try {
    const { role } = req.params;
    const schoolId = getSchoolId(req.user);

    let permissions = await RolePermission.findOne({ schoolId, role });

    // If no permissions found, create default ones
    if (!permissions) {
      permissions = new RolePermission({
        schoolId,
        role,
        permissions: [],
        createdBy: req.user._id
      });
      await permissions.save();
    }

    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePermissions = async (req, res) => {
  try {
    const { role } = req.params;
    const { permissions } = req.body;
    const schoolId = getSchoolId(req.user);

    let rolePermission = await RolePermission.findOne({ schoolId, role });

    if (!rolePermission) {
      rolePermission = new RolePermission({
        schoolId,
        role,
        permissions,
        createdBy: req.user._id
      });
    } else {
      rolePermission.permissions = permissions;
      rolePermission.updatedBy = req.user._id;
    }

    await rolePermission.save();
    res.json({ message: 'Permissions updated successfully', permissions: rolePermission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllPermissions = async (req, res) => {
  try {
    const schoolId = getSchoolId(req.user);
    const permissions = await RolePermission.find({ schoolId });

    // Ensure all roles have permissions
    const roles = ['admin', 'teacher', 'student'];
    for (const role of roles) {
      if (!permissions.find(p => p.role === role)) {
        const defaultPerm = new RolePermission({
          schoolId,
          role,
          permissions: [],
          createdBy: req.user._id
        });
        await defaultPerm.save();
        permissions.push(defaultPerm);
      }
    }

    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPermissions,
  updatePermissions,
  getAllPermissions
};
