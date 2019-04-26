const express = require('express');

const User = require('../models/user');

const router = express.Router();

router.post('/', async (req, res) => {
  const user = new User(req.body);
  try {
    const result = await user.save();
    return res.status(201).send(result);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await User.find({});
    if (result.length > 0) return res.send(result);
    return res.sendStatus(404);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/:id', async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) return res.sendStatus(404);
    return res.send(user);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.patch('/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'age', 'password'];
  const isValid = updates.every(update => allowedUpdates.includes(update));

  if (!isValid) return res.status(500).send({ error: 'Invalid updates' });

  try {
    const user = await User.findById(req.params.id);
    updates.forEach((update) => {
      user[update] = req.body[update];
    });
    await user.save();
    if (!user) return res.sendStatus(404);
    return res.send(user);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.sendStatus(404);
    return res.send(user);
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;
