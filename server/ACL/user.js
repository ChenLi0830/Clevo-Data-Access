const Rule = require('graphql-rule')

// Define access rules.
const UserRule = Rule.create({
  name: 'User',
  props: {
    isAdmin: (model) => model.$context.user.role === 'ClevoAdmin',
    isOwner: (model) => model.$data.id === model.$context.user.id,
  },
  defaultRule:{
    preRead: true,
    read: true,
    readFail: null,
  },
  rules: {
    id: true,
    email: {
      preRead: (model) => model.$props.isAdmin || model.$props.isOwner,
      readFail: () => { throw new Error('Unauthorized') },
    },
    password: false,
    title: {},
    name: {},
    staffId: (model) => model.$props.isOwner,
    role: {},
    createdAt: (model) => model.$props.isAdmin || model.$props.isOwner,
    updatedAt: (model) => model.$props.isAdmin || model.$props.isOwner,
    status: {},
    team: {},
  },
})

module.exports = UserRule
