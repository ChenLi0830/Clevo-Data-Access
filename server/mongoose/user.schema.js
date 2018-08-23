const bcrypt = require('bcrypt-nodejs')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const debug = require('debug')('user.schema')
const uniqueValidator = require('mongoose-unique-validator')

// Every user has an email and password.  The password is not stored as
// plain text - see the authentication helpers below.
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  staffId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  password: {
    type: String
    // required: true
  },
  name: {
    type: String,
    required: true
  },
  title: String,
  role: {
    type: String,
    enum: [
      'master', 'admin', 'staff'
    ],
    default: 'staff'
  },
  status: {
    type: String,
    enum: [
      'active', 'inactive'
    ],
    default: 'active'
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team'
  }
}, {
  timestamps: true
})

UserSchema.plugin(uniqueValidator)

function populateByDefault () {
  debug('pre query populateByDefault')
  this.populate('team')
}

// UserSchema.pre('count', populateByDefault)
UserSchema.pre('find', populateByDefault)
UserSchema.pre('findOne', populateByDefault)
UserSchema.pre('findOneAndUpdate', populateByDefault)
UserSchema.pre('findOneAndRemove', populateByDefault)
UserSchema.pre('update', populateByDefault)

// The user's password is never saved in plain text.  Prior to saving the
// user model, we 'salt' and 'hash' the users password.  This is a one way
// procedure that modifies the password - the plain text password cannot be
// derived from the salted + hashed version. See 'comparePassword' to understand
// how this is used.
UserSchema.pre('save', function save (next) {
  const user = this
  if (!user.isModified('password')) { return next() }
  if (!user.password) { return next() }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err) }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err) }
      user.password = hash
      next()
    })
  })
})

// We need to compare the plain text password (submitted whenever logging in)
// with the salted + hashed version that is sitting in the database.
// 'bcrypt.compare' takes the plain text password and hashes it, then compares
// that hashed password to the one stored in the DB.  Remember that hashing is
// a one way process - the passwords are never compared in plain text form.
UserSchema.methods.comparePassword = function comparePassword (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch)
  })
}

module.exports = mongoose.model('User', UserSchema)
