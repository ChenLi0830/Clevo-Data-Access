const graphql = require('graphql')
const {
  GraphQLObjectType,
  GraphQLString,
} = graphql

const UserType = require('./types/user_type')
const {userLogin, userSignUp, userLogout} = require('../resolvers/mutations/user')

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
        return userSignUp({props: args, req})
      }
    },
    logout: {
      type: UserType,
      resolve: (parentValue, args, req) => {
        return userLogout(req)
      }
    },
    login: {
      type: UserType,
      args: {
        email: {type: GraphQLString},
        password: {type: GraphQLString},
      },
      resolve: (parentValue, {email, password}, req) => {
        return userLogin({email, password, req})
      }
    }
  }
})

module.exports = mutation