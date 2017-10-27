const graphql = require('graphql')
const {
  GraphQLObjectType,
  GraphQLString,
} = graphql

const UserType = require('./types/user_type')
const AuthService = require('../services/auth')

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    signUp: {
      type: UserType,
      args: {
        email: {type: GraphQLString},
        password: {type: GraphQLString},
        title: {type: GraphQLString},
        name: {type: GraphQLString},
        staffId: {type: GraphQLString},
        role: {type: GraphQLString},
        teamName: {type: GraphQLString},
      },
      resolve: (parentValue, args, req) => {
        return AuthService.signup({props: args, req})
      }
    },
    logout: {
      type: UserType,
      resolve: (parentValue, args, req) => {
        const {user} = req
        // console.log("Object.keys(req)", Object.keys(req))
        req.logout()
        return user
      }
    },
    login: {
      type: UserType,
      args: {
        email: {type: GraphQLString},
        password: {type: GraphQLString},
      },
      resolve: (parentValue, {email, password}, req) => {
        return AuthService.login({email, password, req})
      }
    }
  }
})

module.exports = mutation