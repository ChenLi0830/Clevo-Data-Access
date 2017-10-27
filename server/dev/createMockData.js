const {User, Team} = require('../models')
const mongoose = require('mongoose')

const MONGO_URI = 'mongodb://localhost/graphql-rule-test'

mongoose.Promise = global.Promise

// Connect to the mongoDB instance and log a message
// on success or failure
mongoose.connect(MONGO_URI)
mongoose.connection
  .once('open', () => console.log('Connected to MongoLab instance.'))
  .on('error', error => console.log('Error connecting to MongoLab:', error))

let team = new Team({
  name: "team1",
  status: "active",
})

team.save()

// let user = new User({
//   email: '123123',
//   password: '45232',
//   title: "title",
//   name: "name",
//   staffId: "staffId",
//   role: "role",
// })
//
// user.save()
