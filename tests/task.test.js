const request = require('supertest');

const app = require('../src/app');
const Task = require('../src/models/task');
const {
  userOne, userTwo, taskOne, setupDatabase,
} = require('./fixtures/db');

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

test('Should return all the tasks for specified user', async () => {
  const { body } = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(body).toHaveLength(2);
});

test('Should not delete other users tasks', async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});

test('Should not create task with invalid description/completed', async () => {
  const req = request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`);

  await req
    .send({
      description: '',
      completed: true,
    })
    .expect(400);

  await req
    .send({
      description: 'Hellow',
      completed: 'false',
    })
    .expect(400);
});

test('Should not update task with invalid description/completed', async () => {
  const req = request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`);

  await req.send({}).expect(500);

  await req
    .send({
      description: null,
    })
    .expect(500);
});

test('Should delete user task', async () => {
  const { body } = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const task = await Task.findById(body._id);
  expect(task).toBeNull();
});

test('Should not delete task if unauthenticated', async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .send()
    .expect(401);
});

test('Should not update other users task', async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
      description: 'How are you',
    })
    .expect(400);
});

test('Should fetch only completed/incompleted tasks', async () => {
  const { body } = await request(app)
    .get('/tasks/?completed=true')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(body).toHaveLength(1);
});

test('Should fetch only incompleted tasks', async () => {
  const { body } = await request(app)
    .get('/tasks/?completed=false')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(body).toHaveLength(1);
});

test('Should sort tasks by description/completed/createdAt/updatedAt', async () => {
  await request(app)
    .get('/tasks?sortBy=description:desc')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  await request(app)
    .get('/tasks?sortBy=completed:desc')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  await request(app)
    .get('/tasks?sortBy=createdAt:desc')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  await request(app)
    .get('/tasks?sortBy=updatedAt:desc')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should fetch page of tasks', async () => {
  const { body } = await request(app)
    .get('/tasks?limit=1')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(body).toHaveLength(1);
});
