const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const taskSchema = new Schema(
  {
    description: {
      type: String, required: true, trim: true, minlength: 3,
    },
    completed: { type: Boolean, default: false },
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

const Task = model('Task', taskSchema);

module.exports = Task;
