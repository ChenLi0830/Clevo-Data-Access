const graphql = require('graphql')
const { mergeSchemas } = require('graphql-tools')
const { GraphQLSchema } = graphql

const RootQuery = require('./rootQuery')
const mutations = require('./mutations')

// graphql-compose
const OrganizationType = require('./types/organization_type')
const { ComposeStorage } = require('graphql-compose')
const GQC = new ComposeStorage()
GQC.rootQuery().addFields({
  orgById: OrganizationType.getResolver('findById'),
  orgByName: OrganizationType.getResolver('findByName')
})
GQC.rootMutation().addFields({
  orgCreate: OrganizationType.getResolver('createOne'),
  orgDelByName: OrganizationType.getResolver('removeByName')
})

module.exports = mergeSchemas({
  schemas: [
    new GraphQLSchema({
      query: RootQuery,
      mutation: mutations
    }),
    GQC.buildSchema()
  ]
})
