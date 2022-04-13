const passport = require('passport')
const User = require('../models/User')


const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: "326534157553-si9khjeobhf7o3gg4c3jt0onorqrq6gk.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost/5055/google/callback"
  },
  async(accessToken, refreshToken, profile, done)=> {
    const newUser = {
      googleId: profile.id,
      displayName: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      image: profile.photos[0].value,
      email: profile.emails[0].value
    }
    try {
      //find the user in our database 
      let user = await User.findOne({ googleId: profile.id })

      if (user) {
        //If user present in our database.
        done(null, user)
      } else {
        // if user is not preset in our database save user data to database.
        user = await User.create(newUser)
        newUser.save()
        done(null, user)
      }
    } catch (err) {
      console.error(err)
    }
  }
));



passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(null, user);
  });
});