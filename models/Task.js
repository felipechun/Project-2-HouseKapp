const mongoose = require('mongoose');

const { Schema } = mongoose;

const taskSchema = new Schema({
  name: String,
  date: String,
  value: { type: Number, default: 0 },
  amountPaid: Number,
  amountDue: Number,
  originGroup: { type: Schema.Types.ObjectId, ref: 'Group' },
  paidBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  whoOwes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  completed: { type: Boolean, default: false },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});


// editar estrutura paidBy e whoOwes -> Obj nome e valor;

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
