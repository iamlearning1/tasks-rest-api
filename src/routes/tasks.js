const express = require('express');

const Task = require('../models/task');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    const result = await task.save();
    return res.status(201).send(result);
  } catch (err) {
    return res.status(400).send(err);
  }
});

// GET ?completed=true
// GET ?limit=10&skip=20
// GET ?sortBy=createdAt:desc

router.get('/', authMiddleware, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    // const result = await Task.find({ owner: req.user._id });
    // if (result.length > 0) return res.send(result);
    // return res.sendStatus(404);

    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit, 10),
          skip: parseInt(req.query.skip, 10),
          sort,
        },
      })
      .execPopulate();
    if (req.user.tasks.length > 0) return res.send(req.user.tasks);
    return res.sendStatus(404);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (task) return res.send(task);
    return res.sendStatus(404);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  const updates = Object.keys(req.body);
  if (!updates.length) return res.sendStatus(500);
  const allowedUpdates = ['description', 'completed'];
  const isValid = updates.every(update => allowedUpdates.includes(update));
  if (!isValid) return res.status(500).send({ error: 'Invalid updates' });
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.sendStatus(400);
    updates.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();
    return res.send(task);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.sendStatus(404);
    return res.send(task);
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;
