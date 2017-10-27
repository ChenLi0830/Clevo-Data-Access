const graphql = require('graphql')
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID
} = graphql
const UserType = require('./types/user_type')
const TeamType = require('./types/team_type')

const {User} = require('../models/index')
const UserResolver = require('../resolvers/queries/user')
const TeamResolver = require('../resolvers/queries/team')
const UserACL = require('./ACL/user')
const TeamACL = require('./ACL/team')

const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      resolve: (parentsValue, args, req) => {
        if (!req.user) return null
        return UserResolver.getUserWithTeamAndStaffList(req.user)
          .then((user) => new UserACL(user, req)) // Apply ACL layer
      }
    },
    team: {
      type: TeamType,
      args: {
        name: {type: GraphQLString},
      },
      resolve: (parentsValue, args, req) => {
        return TeamResolver.getTeamByName(args.name)
          .then((team) => new TeamACL(team, req)) // Apply ACL layer
      }
    }
  }
})

module.exports = RootQueryType
