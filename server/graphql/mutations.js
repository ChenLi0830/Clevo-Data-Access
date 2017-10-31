const graphql = require('graphql')
const {
  GraphQLObjectType,
  GraphQLString
} = graphql

const UserType = require('./types/user_type')
const TeamType = require('./types/team_type')
const { userLogin, userSignUp, userLogout } = require('../resolvers/mutations/user')
const { teamCreate } = require('../resolvers/mutations/team')

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    teamCreate: {
      type: TeamType,
      args: {
        name: { type: GraphQLString }
      },
      resolve: (parentValue, args) => {
        return teamCreate(args)
      }
    },
    userSignUp: {
      type: UserType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        title: { type: GraphQLString },
        name: { type: GraphQLString },
        staffId: { type: GraphQLString },
        role: { type: GraphQLString },
        teamName: { type: GraphQLString }
      },
      resolve: (parentValue, args, req) => {
        return userSignUp({ props: args, req })
      }
    },
    userLogout: {
      type: UserType,
      resolve: (parentValue, args, req) => {
        return userLogout(req)
      }
    },
    userLogin: {
      type: UserType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString }
      },
      resolve: (parentValue, { email, password }, req) => {
        return userLogin({ email, password, req })
      }
    }

  }
})

module.exports = mutation
