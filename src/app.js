const express = require('express');

require('./db/mongoose');

const UserRouter = require('./routes/users');
const TaskRouter = require('./routes/tasks');

const app = express();
const { PORT } = process.env;

app.use(express.json());

app.use('/users', UserRouter);
app.use('/tasks', TaskRouter);

app.listen(PORT);
