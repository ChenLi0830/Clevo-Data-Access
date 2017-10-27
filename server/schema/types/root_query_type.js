const graphql = require('graphql')
const {
  GraphQLObjectType,
  GraphQLID
} = graphql
const UserType = require('./user_type')
const TeamType = require('./team_type')

const {User} = require('../../models')
const UserResolver = require('../../resolvers/user')
const TeamResolver = require('../../resolvers/team')
const UserACL = require('../../ACL/user')
const TeamACL = require('../../ACL/team')

const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      resolve: (parentsValue, args, req) => {
        return UserResolver.getUserWithTeamAndStaffList(req.user._id)
          .then((user)=> new UserACL(user, req)) // Apply ACL layer
      }
    },
    team: {
      type: TeamType,
      resolve: (parentsValue, args, req) => {
        return TeamResolver.getTeamByName('team1')
          .then((team)=> new TeamACL(team, req)) // Apply ACL layer
      }
    }
  }
})

module.exports = RootQueryType
