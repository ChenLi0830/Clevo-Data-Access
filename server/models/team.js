const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const debug = require('debug')('team_schema')
const uniqueValidator = require('mongoose-unique-validator')

const TeamSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: [
      'active', 'inactive'
    ]
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization'
  }
}, {
  timestamps: true
})

TeamSchema.plugin(uniqueValidator)

// function populateByDefault () {
//   debug('pre query populateByDefault')
//   this.populate('organization')
// }

// // TeamSchema.pre('count', populateByDefault)
// TeamSchema.pre('find', populateByDefault)
// TeamSchema.pre('findOne', populateByDefault)
// TeamSchema.pre('findOneAndUpdate', populateByDefault)
// TeamSchema.pre('findOneAndRemove', populateByDefault)
// TeamSchema.pre('update', populateByDefault)

// // Syncronize with organization.teams
// TeamSchema.pre('save', function save (next) {
//   debug('pre save started', this, this.isModified('organization'))
//   if (this.isModified('organization')) {
//     // remove the member from the previous organization
//     mongoose.model('Organization').find({
//       'teams': this.id
//     }).exec().then(organizations => {
//       let todos = []
//       organizations.forEach(organization => {
//         organization.teams.pull(this.id)
//         todos.push(organization.save())
//       })
//       // add the team to the current organization
//       return mongoose.model('Organization').findById(this.organization).exec().then(organization => {
//         organization.teams.addToSet(this.id)
//         todos.push(organization.save())
//         return todos
//       })
//     }).then((all) => {
//       debug('organization(s) to sync: ', all.length)
//       Promise.all(all).then(result => {
//         debug('pre save finished', result)
//         next()
//       })
//     })
//   } else {
//     next()
//   }
// })

// // Syncronize with organization.teams
// TeamSchema.post('remove', function save (doc, next) {
//   // debug('user team synchronization failed! ', error)
//   debug('post remove started', this)
//   // remove the user from the current team(s), in theory, there should be only one, but just in case
//   mongoose.model('Organization').find({
//     'teams': this.id
//   }).exec().then(organizations => {
//     let todos = []
//     organizations.forEach(organization => {
//       organization.teams.pull(this.id)
//       todos.push(organization.save())
//     })
//     return todos
//   }).then((all) => {
//     debug('organization(s) to sync: ', all.length)
//     Promise.all(all).then(result => {
//       debug('post remove finished', result)
//       next()
//     })
//   })
// })

module.exports = mongoose.model('Team', TeamSchema)
