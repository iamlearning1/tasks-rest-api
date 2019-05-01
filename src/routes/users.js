const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/user');
const authMiddleware = require('../middleware/auth');
const { sendWelcomeEmail } = require('../emails/account');

const router = express.Router();
const upload = multer({
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
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    return res.status(201).send({ user: await result.toJSON(), token });
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

  if (!isValid) return res.status(412).send({ error: 'Invalid updates' });

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
    // await sendUserDeleteEmail(req.user.email, req.user.name);
    return res.send(await req.user.toJSON());
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.post(
  '/me/avatar',
  authMiddleware,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    return res.sendStatus(200);
  },
  // eslint-disable-next-line no-unused-vars
  (error, req, res, next) => res.status(400).send({ error: error.message }),
);

router.delete('/me/avatar', authMiddleware, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  return res.sendStatus(200);
});

router.get('/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) throw new Error('Image not Found');
    res.set('Content-Type', 'image/png');
    return res.send(user.avatar);
  } catch (err) {
    return res.sendStatus(404);
  }
});

module.exports = router;
