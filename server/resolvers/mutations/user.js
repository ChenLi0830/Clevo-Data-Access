const passport = require('passport')

const { User, Team } = require('../../models')

function userSignUp ({ props, req }) {
  const teamName = (props && props.length >= 1) ? props.splice(0, 1) : undefined
  const user = new User(props)

  if (!props.email || !props.password) {
    throw new Error('You must provide an email and password.')
  }

  return User.findOne({ email: props.email })
    .then(existingUser => {
      if (existingUser) { throw new Error('Email in use') }
      return Team.findOne({ name: teamName })
    })
    .then(team => {
      if (!team) { throw new Error('Team doesn\'t exist') }
      user.team = team
      team.staffList.push(user)
      return Promise.all([user.save(), team.save()])
    })
    .then(results => results[0])
    .then(user => {
      user.status = 'active'
      user.createdAt = new Date()
      user.updatedAt = new Date()
      return user.save()
    })
    .then(user => {
      return new Promise((resolve, reject) => {
        req.logIn(user, (err) => {
          if (err) { reject(err) }
          resolve(user)
        })
      })
    })
}

function userLogin ({ email, password, req }) {
  return new Promise((resolve, reject) => {
    passport.authenticate('local', (err, user) => {
      if (err) { reject(err) }
      if (!user) { reject(new Error('Invalid credentials.')) }

      req.login(user, () => resolve(user))
    })({ body: { email, password } })
  })
}

function userLogout (req) {
  const { user } = req
  req.logout()
  return user
}

module.exports = { userSignUp, userLogin, userLogout }
