const { User } = require('../../models/index')

/**
 * An example getUser method that populates through multiple layers
 * */
const getUserWithTeamAndStaffList = (user) => {
  if (!user) return Promise.resolve(null)

  return User
    .findById(user.id)
    .populate({
      path: 'team',
      // Get friends of friends - populate the 'friends' array for every friend
      populate: { path: 'staffList' }
    })
    .then(user => {
      return user
    })
}

module.exports = { getUserWithTeamAndStaffList }
