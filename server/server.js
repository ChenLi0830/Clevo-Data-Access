const express = require('express')
const graphqlHTTP = require('express-graphql')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const MongoStore = require('connect-mongo')(session)
const schema = require('./graphql/schema')
const cors = require('cors')
const { User } = require('./models')
// Create a new Express application
const LocalStrategy = require('passport-local').Strategy
const app = express()

// Serve statically built client
// app.use(express.static('../ClevoClient/build'))

// Enable CORS for /graphql for dev purpose
if (process.env.NODE_ENV === 'dev') {
  const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true // <-- REQUIRED backend setting
  }
  app.use(cors(corsOptions))
}

// Instruct Express to pass on any request made to the '/graphql' route
// to the GraphQL instance.
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

// Mongo connection
const MONGO_URI = process.env.MONGO_URI
mongoose.Promise = global.Promise
mongoose.connect(MONGO_URI, {
  useMongoClient: true
}).then(result => {
  console.log('mongoose connected successfully')

  // Configures express to use sessions.  This places an encrypted identifier
  // on the users cookie.  When a user makes a request, this middleware examines
  // the cookie and modifies the request object to indicate which user made the request
  // The cookie itself only contains the id of a session; more data about the session
  // is stored inside of MongoDB.
  app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'aaabbbcccsecrect',
    store: new MongoStore({
      url: MONGO_URI,
      autoReconnect: true
    })
  }))

  /**
   * passport config
   * */
  // SerializeUser is used to provide some identifying token that can be saved
  // in the users session.  We traditionally use the 'ID' for this.
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // The counterpart of 'serializeUser'.  Given only a user's ID, we must return
  // the user object.  This object is placed on 'req.user'.
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  })

  // Instructs Passport how to authenticate a user using a locally saved email
  // and password combination.  This strategy is called whenever a user attempts to
  // log in.  We first find the user model in MongoDB that matches the submitted email,
  // then check to see if the provided password matches the saved password. There
  // are two obvious failure points here: the email might not exist in our DB or
  // the password might not match the saved one.  In either case, we call the 'done'
  // callback, including a string that messages why the authentication process failed.
  // This string is provided back to the GraphQL client.
  passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
      if (err) { return done(err) }
      if (!user) { return done(null, false, 'Invalid Credentials') }
      user.comparePassword(password, (err, isMatch) => {
        if (err) { return done(err) }
        if (isMatch) {
          return done(null, user)
        }
        return done(null, false, 'Invalid credentials.')
      })
    })
  }))

  // Passport is wired into express as a middleware. When a request comes in,
  // Passport will examine the request's session (as set by the above config) and
  // assign the current user to the 'req.user' object.  See also servces/auth.js
  app.use(passport.initialize())
  app.use(passport.session())
}, error => {
  console.log('mongoose connecting failed', error)
})

module.exports = app
