const express = require('express')
const models = require('./models')
const graphqlHTTP = require('express-graphql')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
// const passportConfig = require('../services/auth')
const MongoStore = require('connect-mongo')(session)
// const schema = require('../schema/schema')
const cors = require('cors')
const Rule = require('graphql-rule')



const graphql = require('graphql')
const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
} = graphql

// Create a new Express application
const app = express()

// Replace with your mongoLab URI
// const MONGO_URI = 'mongodb://user:password@ds157549.mlab.com:57549/auth-graphq';
// const MONGO_URI = 'mongodb://clevoUser:password@ds113505.mlab.com:13505/auth'
const MONGO_URI = 'mongodb://localhost/graphql-rule-test'

// const MONGO_URI = 'mongodb://user:password@ds157549.mlab.com:57549/auth-graphq';library is
// deprecated, replace it with ES2015 Promise
mongoose.Promise = global.Promise

// Connect to the mongoDB instance and log a message
// on success or failure
mongoose.connect(MONGO_URI)
mongoose.connection
  .once('open', () => console.log('Connected to MongoLab instance.'))
  .on('error', error => console.log('Error connecting to MongoLab:', error))

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


// Passport is wired into express as a middleware. When a request comes in,
// Passport will examine the request's session (as set by the above config) and
// assign the current user to the 'req.user' object.  See also servces/auth.js
app.use(passport.initialize())
app.use(passport.session())

// Serve statically built client
// app.use(express.static('../ClevoClient/build'))

// Enable CORS for /graphql for dev purpose, TODO remove this for production
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true // <-- REQUIRED backend setting
}
app.use(cors(corsOptions))

// Define Mongoose schemas.
const UserModel = mongoose.model('User', new mongoose.Schema({
  email: String,
  password: String,
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
  },
}))

const ProfileModel = mongoose.model('Profile', new mongoose.Schema({
  name: String,
  phone: String,
}))

let user = new UserModel({
  email: '123123',
  password: '45232'
})

let profile = new ProfileModel({
  name: 'Penguin',
  phone: '6044013925',
})

user.profile = profile
profile.save()
user.save()

// Define access rules.
const UserRule = Rule.create({
  name: 'User',
  props: {
    // isAdmin: (model) => model.$context.admin,
    // isOwner: (model) => model.$data.id === model.$context.userId,
    isAdmin: (model) => {
      console.log("model.$context", model.$context)
      return true
    },
    isOwner: (model) => true,
  },
  rules: {
    id: true,
    email: {
      preRead: (model) => model.$props.isAdmin || model.$props.isOwner,
      readFail: () => { throw new Error('Unauthorized') },
    },
    password: false,
    profile: {
      type: 'Profile',
      preRead: true,
    },
  },
})

const ProfileRule = Rule.create({
  name: 'Profile',
  rules: {
    name: true,
    phone: {
      preRead: (model) => model.$parent.$props.isAdmin || model.$parent.$props.isOwner,
      readFail: () => null,
    },
  },
})

// Define GraphQL Types.
const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    name: {type: GraphQLString},
    phone: {type: GraphQLString},
  }
})

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {type: GraphQLID},
    email: {type: GraphQLString},
    password: {type: GraphQLString},
    profile: {type: ProfileType},
  }
})

// Define GraphQL Queries.
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      user: {
        type: UserType,
        args: {
          id: {type: GraphQLID}
        },
        resolve: async (_, {id}, sessionContext) => {
          const userId = new mongoose.Types.ObjectId(id)
          const user = await UserModel.findById(userId).populate('profile').exec()
          // return user
          const securedUser = new UserRule(user, sessionContext);
          return securedUser;
        },
      }
    }
  })
})

// // Express GraphQL middleware.
// app.use('/graphql', graphqlHTTP((request) => ({
//   schema: schema,
//   graphiql: true,
//   context: request.session,
// })));

// Instruct Express to pass on any request made to the '/graphql' route
// to the GraphQL instance.
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

let PORT = 3999
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})