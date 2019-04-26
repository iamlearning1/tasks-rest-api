const express = require('express');

const Task = require('../models/task');

const router = express.Router();

router.post('/', async (req, res) => {
  const task = new Task(req.body);

  try {
    const result = await task.save();
    return result.status(201).send(result);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await Task.find({});
    if (result.length > 0) return res.send(result);
    return res.sendStatus(404);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/:id', async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findById(_id);
    if (task) return res.send(task);
    return res.sendStatus(404);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.patch('/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValid = updates.every(update => allowedUpdates.includes(update));
  if (!isValid) return res.status(500).send({ error: 'Invalid updates' });
  try {
    const task = await Task.findById(req.params.id);
    updates.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();
    if (!task) return res.sendStatus(400);
    return res.send(task);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.sendStatus(404);
    return res.send(task);
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;
