const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrganizationSchema = new Schema(
  {
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
    analyticRules: {
      sensitiveWords: [String],
      bannedWords: [String],
      emotionThreshold: Number,
      ratingThreshold: Number
    },
    teams: [{
      type: Schema.Types.ObjectId,
      ref: 'Team'
    }]
  }, {
    timestamps: true
  }
)

module.exports = mongoose.model('Organization', OrganizationSchema)
