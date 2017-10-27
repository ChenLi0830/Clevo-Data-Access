const {Team} = require('../../models/index')

const getTeam = (id) => {
  return Team
    .findById(id)
    .populate({ path: 'staffList' })
    .then(team => {
      return team
    })
}

const getTeamByName = (name) => {
  return Team
    .findOne({name})
    .populate({ path: 'staffList' })
    .then(team => {
      return team
    })
}


module.exports = {getTeam, getTeamByName}