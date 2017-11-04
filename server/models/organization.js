const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrganizationSchema = new Schema(
  {
    name: String,
    status: {
      type: String,
      enum: [
        'active', 'inactive'
      ]
    },
    teams: [{
      type: Schema.Types.ObjectId,
      ref: 'team'
    }],
    analyticRules: {
      sensitiveWords: [String],
      bannedWords: [String],
      emotionThreshold: Number,
      ratingThreshold: Number
    }
  }, {
    timestamps: true
  }
)

module.exports = mongoose.model('Organization', OrganizationSchema)
