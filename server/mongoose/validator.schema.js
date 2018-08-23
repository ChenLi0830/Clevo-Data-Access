const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const debug = require('debug')('team.schema')
const uniqueValidator = require('mongoose-unique-validator')

const ValidatorSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  validatedCalls: [{
    type: Schema.Types.ObjectId,
    ref: 'Call'
  }],
  status: {
    type: String,
    enum: [
      'active', 'inactive'
    ],
    default: 'active'
  }
}, {
  timestamps: true
})

ValidatorSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Validator', ValidatorSchema)
