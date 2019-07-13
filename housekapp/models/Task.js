const mongoose = require('mongoose');

const { Schema } = mongoose;

const tasksSchema = new Schema({
  name: String,
  date: [Schema.Types.Date],
  people: [Schema.Types.ObjectId],
  value: { type: Number, default: 0 },
  paidBy: { type: Schema.Types.ObjectId, default: null },
  whoOwes: { type: [Schema.Types.ObjectId], default: [null] },
  completed: { type: Boolean, default: false },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const Tasks = mongoose.model('Tasks', tasksSchema);
module.exports = Tasks;
