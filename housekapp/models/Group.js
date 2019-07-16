const mongoose = require('mongoose');

const { Schema } = mongoose;

const groupSchema = new Schema({
  name: String,
  people: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
