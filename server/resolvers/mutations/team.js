const {Team} = require('../../models')

function teamCreate (props) {
  if (!props.name) { throw new Error('You must provide a name for the team.') }

  const team = new Team(props)
  return Team.findOne({name: props.name})
    .then(existingTeam => {
      if (existingTeam) { throw new Error('Name already exists') }
      return team.save()
    })
}

module.exports = {teamCreate}
