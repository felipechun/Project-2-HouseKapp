const mongoose = require('mongoose');

const { Schema } = mongoose;

const groupSchema = new Schema({
  name: String,
  people: { type: [String] },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
