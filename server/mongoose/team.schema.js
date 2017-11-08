const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const debug = require('debug')('team.schema')
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

module.exports = mongoose.model('Team', TeamSchema)
