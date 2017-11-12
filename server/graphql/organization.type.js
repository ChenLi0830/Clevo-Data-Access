const { composeWithMongoose } = require('graphql-compose-mongoose')
const debug = require('debug')('organization.type')
const { OrganizationRule } = require('./rules')

// convert mongoose schema
const { OrganizationSchema } = require('../mongoose')
const OrganizationType = composeWithMongoose(OrganizationSchema)

// add additional resolvers
OrganizationType.addResolver({
  name: 'findByName',
  type: OrganizationType,
  args: {
    name: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return OrganizationSchema.findOne({name: args.name})
  }
})

// apply mutation access wrapping
OrganizationType.wrapResolverResolve('createOne', masterMutable)
OrganizationType.wrapResolverResolve('updateById', adminMutable)
OrganizationType.wrapResolverResolve('removeById', masterMutable)

function masterMutable (next) {
  return (rp) => {
    // rp = resolveParams = { source, args, context, info }
    debug('masterAccess wrap', rp.args, rp.context.user)
    let rule = new OrganizationRule(rp.args.record, rp.context)
    if (!rule.$props.isMaster) {
      throw new Error('You need to be master to perform this action.')
    }
    return next(rp)
  }
}

function adminMutable (next) {
  return (rp) => {
    // rp = resolveParams = { source, args, context, info }
    debug('adminAccess wrap', rp.args, rp.context.user)
    let rule = new OrganizationRule(rp.args.record, rp.context)
    if (!rule.$props.isMaster && !rule.$props.isAdmin) {
      throw new Error('You need to be admin to perform this action.')
    }
    return next(rp)
  }
}

module.exports = OrganizationType
