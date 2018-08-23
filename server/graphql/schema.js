const { CallType, OrganizationType, TeamType, UserType, ValidatorType } = require('./')
const debug = require('debug')('schema')

// relations
UserType.setField('team', TeamType)
UserType.addRelation('organization', {
  resolver: OrganizationType.getResolver('findById'),
  prepareArgs: {
    _id: (source) => source.team.organization
  }
})
TeamType.addRelation('users', {
  resolver: UserType.getResolver('findMany'),
  prepareArgs: {
    filter: (source) => {
      return { team: source.id }
    }
  }
})
OrganizationType.addRelation('teams', {
  resolver: TeamType.getResolver('findMany'),
  prepareArgs: {
    filter: (source) => {
      return { organization: source.id }
    }
  }
})
OrganizationType.addRelation('users', {
  resolver: UserType.getResolver('findMany'),
  prepareArgs: {
    filter: (source) => {
      return { organization: source.id }
    }
  }
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
CallType.addRelation('validators', {
  resolver: ValidatorType.getResolver('findByIds'),
  prepareArgs: {
    _ids: source => source.riskyRatings.map(rating => rating.validator)
  }
})
ValidatorType.addRelation('validatedCalls', {
  resolver: CallType.getResolver('findByIds'),
  prepareArgs: {
    _ids: (source) => source.validatedCalls
  }
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
  callBySource: CallType.getResolver('findBySource'),
  callsByIds: CallType.getResolver('findByIds'),
  calls: CallType.getResolver('findMany'),
  // validatorsBySource: CallType.getResolver('findBySource'),
  validatorsByIds: CallType.getResolver('findByIds'),
  validators: CallType.getResolver('findMany'),
  validatorByName: ValidatorType.getResolver('findByName') // custom resolver
  // validatorByName: ValidatorType.getResolver('findByName')
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
  callCreate: CallType.getResolver('createOne'),
  callUpdate: CallType.getResolver('updateById'),
  callDelete: CallType.getResolver('removeById'),
  validatorValidateCall: ValidatorType.getResolver('validateCall'),
  validatorCreate: ValidatorType.getResolver('createOne'),
  validatorUpdate: ValidatorType.getResolver('updateById'),
  validatorDelete: ValidatorType.getResolver('removeById'),
  validatorDeleteByName: ValidatorType.getResolver('removeByName')  // custom resolver
})

module.exports = GQC.buildSchema()
