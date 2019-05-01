const request = require('supertest');

const app = require('../src/app');
const Task = require('../src/models/task');
const { userOne, userOneId, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create a task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'Node JS',
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task.description).toEqual('Node JS');
  expect(task.completed).toBeFalsy();
});
