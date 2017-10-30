const graphql = require('graphql')
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID
} = graphql

const TeamType = require('./team_type')

const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => {
    return {
      id: { type: GraphQLID },
      email: { type: GraphQLString },
      title: { type: GraphQLString },
      name: { type: GraphQLString },
      staffId: { type: GraphQLString },
      role: { type: GraphQLString },
      team: { type: TeamType }
    }
  }
})

module.exports = UserType
