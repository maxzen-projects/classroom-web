const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const School = require('../models/School');
const User = require('../models/User');
const upload=require('../middleware/uploadSchoolLogo');

const router = express.Router();

// const buildSchoolPayload = (body) => {
//   const {
//     name,
//     code,
//     email,
//     phone,
//     address,
//     city,
//     state,
//     country,
//     subscriptionPlan,
//     status
//   } = body;

//   return {
//     name,
//     code,
//     email,
//     phone,
//     address,
//     city,
//     state,
//     country,
//     subscriptionPlan,
//     status
//   };
// };



const buildSchoolPayload = (body, file = null) => {
  const {
    name,
    code,
    email,
    phone,
    address,
    city,
    state,
    country,
    subscriptionPlan,
    status
  } = body;

  const payload = {
    name,
    code,
    email,
    phone,
    address,
    city,
    state,
    country,
    subscriptionPlan,
    status
  };

  // ✅ Add logo path
  if (file) {
    payload.logo = `/uploads/schools/${file.filename}`;
  }

  return payload;
};


router.post(
  '/',
  authMiddleware,
  roleMiddleware('super_admin'),
  upload.single('logo'),
  async (req, res) => {
  try {
    const schoolPayload = buildSchoolPayload(req.body,req.file);
    const school = new School(schoolPayload);
    await school.save();

    res.status(201).json(school);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'School code or email already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.get('/', authMiddleware, roleMiddleware('super_admin'), async (req, res) => {
  try {
    const schools = await School.find().populate('admin', 'name email');
    res.json(schools);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const requestedSchoolId = req.params.id;
    const userSchoolId = req.user.schoolId || req.user.school;
    const canViewSchool =
      req.user.role === 'super_admin' ||
      (userSchoolId && userSchoolId.toString() === requestedSchoolId);

    if (!canViewSchool) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const school = await School.findById(requestedSchoolId).populate('admin', 'name email');
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    res.json(school);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('super_admin'),
  upload.single('logo'),
  async (req, res) => {
  try {
    const schoolPayload = buildSchoolPayload(req.body,req.file);
    const school = await School.findByIdAndUpdate(req.params.id, schoolPayload, { new: true, runValidators: true });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json(school);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'School code or email already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('super_admin'), async (req, res) => {
  try {
    await School.findByIdAndDelete(req.params.id);
    res.json({ message: 'School deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/assign-admin', authMiddleware, roleMiddleware('super_admin'), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Name, email, password, and phone are required' });
    }

    let admin = await User.findOne({ email: email.toLowerCase() });

    if (!admin) {
      admin = new User({
        name,
        email: email.toLowerCase(),
        password,
        phone,
        role: 'admin',
        school: req.params.id,
        accountStatus: 'active'
      });
      await admin.save();
    } else {
      admin.role = 'admin';
      admin.school = req.params.id;
      admin.phone = phone;
      if (password) {
        admin.password = password;
      }
      await admin.save();
    }

    const school = await School.findByIdAndUpdate(
      req.params.id,
      { admin: admin._id },
      { new: true }
    ).populate('admin', 'name email');

    res.json(school);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'User email already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
