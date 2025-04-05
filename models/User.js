const mongoose = require("mongoose");

// Starting schema of User Collection
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  password: { type: String, required: true, minlength: 6 },
  type: { type: String, enum: ['user', 'admin'], default: 'user' }
});

module.exports = mongoose.model("User", UserSchema);
