const express = require('express');

require('./db/mongoose');

const UserRouter = require('./routes/users');
const TaskRouter = require('./routes/tasks');

const app = express();

app.use(express.json());

app.use('/users', UserRouter);
app.use('/tasks', TaskRouter);

module.exports = app;
