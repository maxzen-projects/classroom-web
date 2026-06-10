const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const Subject = require('../models/Subject');

const router = express.Router();

router.use(authMiddleware);

const getSubjects = async (req, res) => {
  try {
    const schoolId = req.user.school || req.user.schoolId;
    const subjects = await Subject.find(schoolId ? { schoolId } : {}).sort({ name: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSubject = async (req, res) => {
  try {
    const schoolId = req.user.school || req.user.schoolId;
    const name = req.body.name || req.body.title;

    if (!schoolId) {
      return res.status(400).json({ message: 'School is required to create a subject' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    const subject = new Subject({
      schoolId,
      name: name.trim()
    });

    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Subject already exists' });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: error.message });
  }
};

const updateSubject = async (req, res) => {
  try {
    const schoolId = req.user.school || req.user.schoolId;
    const subject = await Subject.findOne({ _id: req.params.id, ...(schoolId ? { schoolId } : {}) });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    subject.name = req.body.name || req.body.title || subject.name;
    await subject.save();
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const schoolId = req.user.school || req.user.schoolId;
    const subject = await Subject.findOne({ _id: req.params.id, ...(schoolId ? { schoolId } : {}) });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await subject.deleteOne();
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.get('/', getSubjects);
router.get('/admin/all', roleMiddleware(['admin', 'super_admin']), getSubjects);
router.post('/', roleMiddleware(['teacher', 'admin', 'super_admin']), createSubject);
router.put('/:id', roleMiddleware(['teacher', 'admin', 'super_admin']), updateSubject);
router.delete('/:id', roleMiddleware(['teacher', 'admin', 'super_admin']), deleteSubject);

module.exports = router;
