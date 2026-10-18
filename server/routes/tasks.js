const router = require('express').Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');
router.use(auth);

const pick = (b) => {
  const o = {};
  ['title', 'description', 'status', 'priority', 'deadline'].forEach((k) => {
    if (b[k] !== undefined) o[k] = k === 'deadline' ? (b[k] || null) : b[k];
  });
  return o;
};

// GET /api/tasks?status=&priority=&search=&overdue=true&sort=deadline|-createdAt
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, search, overdue, sort } = req.query;
    const q = { user: req.userId };
    if (status) q.status = status;
    if (priority) q.priority = priority;
    if (search) q.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (overdue === 'true') { q.deadline = { $lt: new Date() }; q.status = { $ne: 'done' }; }
    res.json(await Task.find(q).sort(sort || '-createdAt'));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.body.title) return res.status(400).json({ message: 'Title is required' });
    res.status(201).json(await Task.create({ ...pick(req.body), user: req.userId }));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const t = await Task.findOne({ _id: req.params.id, user: req.userId });
    t ? res.json(t) : res.status(404).json({ message: 'Task not found' });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const t = await Task.findOneAndUpdate({ _id: req.params.id, user: req.userId }, pick(req.body), { new: true, runValidators: true });
    t ? res.json(t) : res.status(404).json({ message: 'Task not found' });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const t = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    t ? res.json({ message: 'Task deleted' }) : res.status(404).json({ message: 'Task not found' });
  } catch (e) { next(e); }
});

module.exports = router;
