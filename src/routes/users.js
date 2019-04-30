const express = require('express');
const multer = require('multer');

const User = require('../models/user');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const upload = multer({
  dest: 'avatar',
  limits: {
    fieldSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload a Image file of format .PNG, .JPEG, .JPG'));
    }
    return cb(undefined, true);
  },
});

router.post('/', async (req, res) => {
  const user = new User(req.body);
  try {
    const result = await user.save();
    const token = await user.generateAuthToken();
    return res.status(201).send({ result: await result.toJSON(), token });
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    return res.send({ user: await user.toJSON(), token });
  } catch (err) {
    return res.sendStatus(400);
  }
});

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
});

router.post('/logoutAll', authMiddleware, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
});

router.get('/me', authMiddleware, async (req, res) => res.send(await req.user.toJSON()));

router.patch('/me', authMiddleware, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'age', 'password'];
  const isValid = updates.every(update => allowedUpdates.includes(update));

  if (!isValid) return res.status(500).send({ error: 'Invalid updates' });

  try {
    const { user } = req;
    updates.forEach((update) => {
      user[update] = req.body[update];
    });
    await user.save();
    return res.send(await user.toJSON());
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.delete('/me', authMiddleware, async (req, res) => {
  try {
    await req.user.remove();
    return res.send(await req.user.toJSON());
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.post('/me/avatar', upload.single('avatar'), (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
