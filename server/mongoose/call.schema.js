const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator')

const CallSchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        'active', 'inactive'
      ]
    },
    staff: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization'
    },
    format: {
      type: String,
      enum: [
        'mp3', 'wav'
      ]
    },
    encoding: {
      type: String,
      enum: [
        'linear16', 'pcm'
      ]
    },
    source: {
      type: String,
      unique: true,
      index: true
    },
    riskyRatings: [{
      validator: String,
      rating: {
        type: Number,
        min: 0,
        max: 4,
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        }
      }
    }],
    startedAt: Date,
    transcription: {
      processor: {
        type: String,
        enum: [
          'iflytek', 'baidu'
        ]
      },
      taskId: String,
      status: {
        type: String,
        enum: [
          'started', 'processing', 'completed'
        ]
      },
      result: Schema.Types.Mixed
    },
    emotion: {
      processor: {
        type: String,
        enum: [
          'clevo', 'other'
        ]
      },
      taskId: String,
      status: {
        type: String,
        enum: [
          'started', 'processing', 'completed'
        ]
      },
      result: Schema.Types.Mixed
    },
    nlp: {
      processor: {
        type: String,
        enum: [
          'clevo', 'other'
        ]
      },
      taskId: String,
      status: {
        type: String,
        enum: [
          'started', 'processing', 'completed'
        ]
      },
      result: Schema.Types.Mixed
    },
    statistics: {
      speechDuration: Number,
      slienceDuration: Number,
      staffTalkDuraion: Number,
      customerTalkDuration: Number
    },
    scores: {
      politeness: Number,
      scripts: Number,
      emotion: Number,
      overall: Number
    },
    breakdowns: [{
      begin: Number,
      end: Number,
      transcript: String,
      emotion: [Number],
      intent: String,
      speaker: {
        type: String,
        enum: [
          'staff', 'customer'
        ]
      },
      bannedWords: [String],
      sensitiveWords: [String]
    }],
    subject: String
  }, {
    timestamps: true
  }
)

CallSchema.plugin(uniqueValidator)

CallSchema.index({'createdAt': 1})
CallSchema.index({'updatedAt': 1})

module.exports = mongoose.model('Call', CallSchema)
