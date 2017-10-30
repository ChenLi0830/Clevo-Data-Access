const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TeamSchema = new Schema(
  {
    name: String,
    createdAt: Date,
    updatedAt: Date,
    status: String,
    staffList: [{
      type: Schema.Types.ObjectId,
      ref: 'user'
    }]
  }
)

module.exports = mongoose.model('team', TeamSchema)
