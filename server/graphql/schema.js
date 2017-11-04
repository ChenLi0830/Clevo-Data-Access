const graphql = require('graphql')
const { mergeSchemas } = require('graphql-tools')
const { GraphQLSchema } = graphql

const RootQuery = require('./rootQuery')
const mutations = require('./mutations')

// graphql-compose
const OrganizationType = require('./types/organization_type')
const CallType = require('./types/call_type')
const { ComposeStorage } = require('graphql-compose')
const GQC = new ComposeStorage()
GQC.rootQuery().addFields({
  organizationById: OrganizationType.getResolver('findById'),
  organizationByName: OrganizationType.getResolver('findByName'), // custom resolver
  organizationByIds: OrganizationType.getResolver('findByIds'),
  organizations: OrganizationType.getResolver('findMany'),
  callById: CallType.getResolver('findById'),
  callByIds: CallType.getResolver('findByIds'),
  calls: CallType.getResolver('findMany')
})
GQC.rootMutation().addFields({
  organizationCreate: OrganizationType.getResolver('createOne'),
  organizationUpdate: OrganizationType.getResolver('updateById'),
  organizationDelete: OrganizationType.getResolver('removeById'),
  organizationDeleteByName: OrganizationType.getResolver('removeByName'),  // custom resolver
  callCreate: CallType.getResolver('createOne'),
  callUpdate: CallType.getResolver('updateById'),
  callDelete: CallType.getResolver('removeById')
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
