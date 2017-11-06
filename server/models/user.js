const bcrypt = require('bcrypt-nodejs')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const debug = require('debug')('user_schema')
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
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  title: String,
  role: {
    type: String,
    enum: [
      'admin', 'staff'
    ]
  },
  status: {
    type: String,
    enum: [
      'active', 'inactive'
    ]
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team'
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization'
  }
}, {
  timestamps: true
})

UserSchema.plugin(uniqueValidator)

// // Syncronize with team.users
// UserSchema.pre('save', function save (next) {
//   debug('pre save started', this, this.isModified('team'))
//   if (this.isModified('team')) {
//     // remove the user from the previous team
//     mongoose.model('Team').find({
//       'users': this.id
//     }).exec().then(teams => {
//       let todos = []
//       teams.forEach(team => {
//         team.users.pull(this.id)
//         todos.push(team.save())
//       })
//       // add the user to the current team
//       return mongoose.model('Team').findById(this.team).exec().then(team => {
//         team.users.addToSet(this.id)
//         todos.push(team.save())
//         return todos
//       })
//     }).then((all) => {
//       debug('team(s) to sync: ', all.length)
//       Promise.all(all).then(result => {
//         debug('pre save finished', result)
//         next()
//       })
//     })
//   } else {
//     next()
//   }
// })

// // Syncronize with team.users
// UserSchema.post('remove', function save (doc, next) {
//   // debug('user team synchronization failed! ', error)
//   debug('post remove started', this)
//   // remove the user from the current team(s), in theory, there should be only one, but just in case
//   mongoose.model('Team').find({
//     'users': this.id
//   }).exec().then(teams => {
//     let todos = []
//     teams.forEach(team => {
//       team.users.pull(this.id)
//       todos.push(team.save())
//     })
//     return todos
//   }).then((all) => {
//     debug('team(s) to sync: ', all.length)
//     Promise.all(all).then(result => {
//       debug('post remove finished', result)
//       next()
//     })
//   })
// })

// The user's password is never saved in plain text.  Prior to saving the
// user model, we 'salt' and 'hash' the users password.  This is a one way
// procedure that modifies the password - the plain text password cannot be
// derived from the salted + hashed version. See 'comparePassword' to understand
// how this is used.
UserSchema.pre('save', function save (next) {
  const user = this
  if (!user.isModified('password')) { return next() }
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
