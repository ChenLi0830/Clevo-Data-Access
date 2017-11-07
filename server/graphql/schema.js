const UserType = require('./user_graph')
const TeamType = require('./team_graph')
const OrganizationType = require('./organization_graph')
const CallType = require('./call_graph')

// relations
UserType.addRelation('team', {
  resolver: TeamType.getResolver('findById'),
  prepareArgs: {
    _id: (source) => source.team
  },
  projection: { team: true }
})
UserType.addRelation('organization', {
  resolver: OrganizationType.getResolver('findById'),
  prepareArgs: {
    _id: (source) => source.organization
  },
  projection: { organization: true }
})
TeamType.addRelation('organization', {
  resolver: OrganizationType.getResolver('findById'),
  prepareArgs: {
    _id: (source) => source.organization
  },
  projection: { organization: true }
})
CallType.addRelation('staff', {
  resolver: UserType.getResolver('findById'),
  prepareArgs: {
    _id: (source) => source.staff
  },
  projection: { staff: true }
})
CallType.addRelation('organization', {
  resolver: OrganizationType.getResolver('findById'),
  prepareArgs: {
    _id: (source) => source.organization
  },
  projection: { organization: true }
})

// resolvers
const { ComposeStorage } = require('graphql-compose')
const GQC = new ComposeStorage()
GQC.rootQuery().addFields({
  userCurrent: UserType.getResolver('current'), // custom resolver
  userById: UserType.getResolver('findById'),
  userByEmail: UserType.getResolver('findByEmail'), // custom resolver
  usersByIds: UserType.getResolver('findByIds'),
  users: UserType.getResolver('findMany'),
  teamById: TeamType.getResolver('findById'),
  teamByName: TeamType.getResolver('findByName'), // custom resolver
  teamsByIds: TeamType.getResolver('findByIds'),
  teams: TeamType.getResolver('findMany'),
  organizationById: OrganizationType.getResolver('findById'),
  organizationByName: OrganizationType.getResolver('findByName'), // custom resolver
  organizationsByIds: OrganizationType.getResolver('findByIds'),
  organizations: OrganizationType.getResolver('findMany'),
  callById: CallType.getResolver('findById'),
  callsByIds: CallType.getResolver('findByIds'),
  calls: CallType.getResolver('findMany')
})
GQC.rootMutation().addFields({
  userLogin: UserType.getResolver('login'), // custom resolver
  userLogout: UserType.getResolver('logout'), // custom resolver
  userSignup: UserType.getResolver('signup'), // custom resolver
  userResetPassword: UserType.getResolver('resetPassword'), // custom resolver
  userChangePassword: UserType.getResolver('changePassword'), // custom resolver
  userUpdate: UserType.getResolver('updateById'),
  userDelete: UserType.getResolver('removeById'),
  userDeleteByEmail: UserType.getResolver('removeByEmail'),  // custom resolver
  teamCreate: TeamType.getResolver('createOne'),
  teamUpdate: TeamType.getResolver('updateById'),
  teamDelete: TeamType.getResolver('removeById'),
  teamDeleteByName: TeamType.getResolver('removeByName'),  // custom resolver
  organizationCreate: OrganizationType.getResolver('createOne'),
  organizationUpdate: OrganizationType.getResolver('updateById'),
  organizationDelete: OrganizationType.getResolver('removeById'),
  organizationDeleteByName: OrganizationType.getResolver('removeByName'),  // custom resolver
  callCreate: CallType.getResolver('createOne'),
  callUpdate: CallType.getResolver('updateById'),
  callDelete: CallType.getResolver('removeById')
})

module.exports = GQC.buildSchema()
