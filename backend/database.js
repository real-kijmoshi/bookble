const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Book Schema
const BookSchema = new mongoose.Schema({
  isbn: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  cover: { type: String, required: true },
  description: { type: String, required: true }
}, { timestamps: true });

// Collection Schema
const CollectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: String, required: true }, // ISBN
  provider: { type: String, required: true },
  read: { type: Boolean, default: false },
  rating: { type: Number, min: 0, max: 5, default: null }
}, { timestamps: true });

// Review Schema
const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  review: { type: String, required: true }
}, { timestamps: true });

// Models
const User = mongoose.model('User', UserSchema);
const Book = mongoose.model('Book', BookSchema);
const Collection = mongoose.model('Collection', CollectionSchema);
const Review = mongoose.model('Review', ReviewSchema);




module.exports = {
  User,
  Book,
  Collection,
  Review
};