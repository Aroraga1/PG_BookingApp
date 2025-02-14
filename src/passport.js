const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2');

passport.serializeUser((user,done)=>{
    done(null,user);
});
passport.deserializeUser(function(user,done){
    done(null,user);
});

passport.use(new GoogleStrategy({
    clientID:process.env.CLIENT_ID,
    clientSeceret: process.env.CLIENT_SECERET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
},
function(request, accessToken, refreshToken, profile, done){
    return done(null,profile);
}
));