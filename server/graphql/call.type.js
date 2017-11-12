const { composeWithMongoose } = require('graphql-compose-mongoose')
const debug = require('debug')('call.type')
const { CallRule } = require('./rules')

// convert mongoose schema
const { CallSchema } = require('../mongoose')
const CallType = composeWithMongoose(CallSchema)

// apply mutation access wrapping
CallType.wrapResolverResolve('removeById', adminMutable)

function adminMutable (next) {
  return (rp) => {
    // rp = resolveParams = { source, args, context, info }
    debug('adminAccess wrap', rp.args, rp.context.user)
    let rule = new CallRule(rp.args, rp.context)
    if (!rule.$props.isMaster && !rule.$props.isAdmin) {
      throw new Error('You need to be admin to perform this action.')
    }
    return next(rp)
  }
}

module.exports = CallType
