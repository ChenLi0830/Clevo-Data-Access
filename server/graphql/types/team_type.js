const graphql = require('graphql')
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList
} = graphql

const TeamType = new GraphQLObjectType({
  name: 'TeamType',
  fields: () => {
    return {
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      status: { type: GraphQLString },
      staffList: {
        // import the UserType in the lazy load function to solve circular dependency problem
        type: new GraphQLList(require('./user_type'))
      }
    }
  }
})

module.exports = TeamType
