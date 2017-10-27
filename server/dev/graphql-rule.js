const Rule = require('graphql-rule')

// // create access control model for your data
// const Model = Rule.create({
//   // name for this access model
//   name: 'Model',
//
//   // define access rules
//   rules: {
//     // allow access to `public` property.
//     public: true,
//
//     secret: {
//       // disallow access to `secret` property.
//       read: false,
//
//       // throw an error when read is disallowed.
//       readFail: () => { throw new Error('Access denied') },
//     },
//
//     conditional: {
//       // access raw data via `$data`.
//       // conditionally allow access if `conditional` <= 3.
//       read: (model) => model.$data.conditional <= 3,
//
//       readFail: (model) => { throw new Error(`conditional ${model.$data.conditional} > 3`) },
//     },
//   },
// })
//
// // let user = new User({
// //   email: 'abc@gmail.com',
// //   password: '123',
// //   title: 'Mr.',
// //   name: 'C.Lee'
// // })
//
// // create a wrapped instance of your data.
// const securedData = new Model({
//   public: 'public data',
//   secret: 'something secret',
//   conditional: 5,
// });
//
// console.log(securedData.public) // 'public data'
//
// // console.log(securedData.secret) // throws Error('Access denied').
//
// console.log(securedData.conditional) // throws Error('5 > 3').
//
// // same access model for different data.
// const securedData2 = new Model({conditional: 1})
//
// console.log(securedData2.conditional) // 1 since 1 < 3.

// set default `readFail`
Rule.config({
  readFail: () => { throw new Error('Access denied'); },
});

const UserRule = Rule.create({
  name: 'User',
  
  // props are lazily initialized and cached once initialized.
  // accessible via `model.$props`.
  props: {
    isAdmin: (model) => model.$context.admin,
    
    isAuthenticated: (model) => Boolean(model.$context.userId),
    
    isOwner: (model) => model.$data.id === model.$context.userId,
  },
  
  rules: {
    // Everyone can read `id`.
    id: true,
    
    email: {
      // allow access by admin or owner.
      read: (model) => model.$props.isAdmin || model.$props.isOwner,
      
      // returns null when read denied.
      readFail: null,
    },
    
    // No one can read `password`.
    password: false,
    
    profile: {
      // Use `Profile` Rule for `profile`.
      type: 'Profile',
      
      // allow access by all authenticated users
      read: (model) => model.$props.isAuthenticated,
      
      readFail: () => { throw new Error('Login Required'); },
    },
  },
});

const ProfileRule = Rule.create({
  name: 'Profile',
  
  rules: {
    name: true,
    
    phone: {
      // Access `UserRule` instance via `$parent`.
      read: (model) => model.$parent.$props.isAdmin || model.$parent.$props.isOwner,
      
      readFail: () => { throw new Error('Not authorized!'); },
    },
  },
});


const session = {
  userId: 'session_user_id',
  admin: false,
};

const userData = {
  id: 'user_id',
  email: 'user@example.com',
  password: 'secret',
  profile: {
    name: 'John Doe',
    phone: '123-456-7890',
  },
};

// pass `session` as a second param to make it available as `$context`.
const user = new UserRule(userData, session);

console.log("user", user)

user.id // 'user_id'

user.email // `null` since not admin nor owner.

// user.password // throws Error('Access denied').

console.log('user.profile', user.profile) // `ProfileRule` instance. accessible since authenticated.

console.log('user.profile.name', user.profile.name) // 'John Doe'

console.log('user.profile.phone', user.profile.phone) // throws Error('Not authorized!') since not admin nor owner.


