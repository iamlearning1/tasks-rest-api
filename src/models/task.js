const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const taskSchema = new Schema({
  description: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
});

// taskSchema.pre('save', async function (next) {
//   const task = this;
//   console.log('tasksssss');
//   next();
// });

const Task = model('Task', taskSchema);

module.exports = Task;
