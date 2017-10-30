const Rule = require('graphql-rule')

// Define access rules.
const TeamRule = Rule.create({
  name: 'Team',
  props: {
    isAdmin: (model) => model.$context.user.role === 'ClevoAdmin',
    isMember: (model) => {
      if (!model.$context.user) return false
      return model.$data.id === model.$context.user.team.toString()
    }
  },
  rules: {
    id: true,
    name: true,
    status: true,
    staffList: (model) => {
      return model.$props.isMember
    }
  }
})

module.exports = TeamRule
