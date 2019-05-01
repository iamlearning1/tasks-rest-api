const request = require('supertest');

const app = require('../src/app');
const User = require('../src/models/user');
const { userOne, userOneId, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should login an existing user', async () => {
  const { body } = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const response = await User.findById({ _id: body.user._id });
  expect(body.token).toBe(response.tokens[1].token);
});

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not login non existent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'alpha@alpha.com',
      password: 'pass123456',
    })
    .expect(400);
});

test("Should delete user's account", async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test('should not delete user account', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
});

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Bhanu',
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toEqual('Bhanu');
});

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'Mumbai',
    })
    .expect(412);
});

test('Should signup a new user', async () => {
  const {
    body: { user },
  } = await request(app)
    .post('/users')
    .send({
      name: 'Deepak',
      email: 'testing@test.com',
      password: 'testing123',
    })
    .expect(201);

  const response = await User.findById(user._id);
  expect(response).not.toBeNull();

  expect(user).toMatchObject({
    name: 'Deepak',
    email: 'testing@test.com',
  });

  expect(user.password).not.toBe('testing123');
});
