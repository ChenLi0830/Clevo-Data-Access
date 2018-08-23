const Rule = require('graphql-rule')
// const debug = require('debug')('organization.rule')

// Define access rules.
const OrganizationRule = Rule.create({
  name: 'Organization',
  props: {
    isMaster: (model) => {
      return !!model.$context.user && (model.$context.user.role === 'master')
    },
    isAdmin: (model) => {
      return !!model.$context.user && !!model.$context.user.organization &&
        (model.$context.user.role === 'admin') && (model.$context.user.organization._id.toString() === model.$data._id.toString())
    },
    isOwner: (model) => {
      return !!model.$context.user && !!model.$context.user.organization && !!model.$data &&
        (model.$context.user.organization._id.toString() === model.$data._id.toString())
    }
  },
  defaultRule: {
    preRead: true,
    read: true
  },
  rules: {
    users: {
      preRead: (model) => {
        return model.$props.isMaster || model.$props.isAdmin || model.$props.isMember
      },
      readFail: () => { throw new Error('Permission denied to read users field') }
    },
    teams: {
      preRead: (model) => {
        return model.$props.isMaster || model.$props.isAdmin || model.$props.isMember
      },
      readFail: () => { throw new Error('Permission denied to read teams field') }
    }
  }
})

module.exports = OrganizationRule
