const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate')

const { Schema } = mongoose;

const userSchema = new Schema({
  // username = email
  username: { type: String, unique: true },
  password: { type: String },
  name: { type: String },
  // lembrar de verificar Ids para conflitos ao criar novos grupos.
  // Não coloco unique para poder ter valor default.
  groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
  confirmationCode: { type: String },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  imgPath: String,
  imgName: String,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);
module.exports = User;
