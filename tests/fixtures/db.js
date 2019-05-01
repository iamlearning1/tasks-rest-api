const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../../src/models/user');

const userOneId = new mongoose.Types.ObjectId();

const userOne = {
  _id: userOneId,
  name: 'Deepak',
  email: 'test@test.com',
  password: 'testing123',
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET_KEY),
    },
  ],
};

const setupDatabase = async () => {
  await User.deleteMany();
  await new User(userOne).save();
};

module.exports = {
  userOneId,
  userOne,
  setupDatabase,
};
