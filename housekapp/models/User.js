const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  // username = email
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  groupName: { type: String, default: null },
  // lembrar de verificar Ids para conflitos ao criar novos grupos.
  // Não coloco unique para poder ter valor default.
  groupId: { type: Schema.Types.ObjectId, default: null },
  confirmationCode: { type: String, required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  expenses: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  imgPath: String,
  imgName: String,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
