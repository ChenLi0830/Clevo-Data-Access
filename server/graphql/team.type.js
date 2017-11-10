const { composeWithMongoose } = require('graphql-compose-mongoose')
const debug = require('debug')('team.type')
const { TeamRule } = require('./rules')

// convert mongoose schema
const { TeamSchema } = require('../mongoose')
const TeamType = composeWithMongoose(TeamSchema)

// add additional resolvers
TeamType.addResolver({
  name: 'findByName',
  type: TeamType,
  args: {
    name: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return TeamSchema.findOne({name: args.name})
  }
})

TeamType.addResolver({
  name: 'removeByName',
  type: TeamType.getResolver('removeById').getType(),
  args: {
    name: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return TeamSchema.findOneAndRemove({name: args.name}).then(result => {
      return {
        recordId: result.id,
        record: result
      }
    })
  }
})

// apply mutation access wrapping
TeamType.wrapResolverResolve('createOne', adminMutable)
TeamType.wrapResolverResolve('updateById', adminMutable)
TeamType.wrapResolverResolve('removeById', adminMutable)
TeamType.wrapResolverResolve('removeByName', adminMutable)

function adminMutable (next) {
  return (rp) => {
    // rp = resolveParams = { source, args, context, info }
    debug('adminAccess wrap', rp.args, rp.context.user)
    let rule = new TeamRule(rp.args.record, rp.context)
    if (!rule.$props.isAdmin) {
      throw new Error('You need to be admin to perform this action.')
    }
    return next(rp)
  }
}

module.exports = TeamType
