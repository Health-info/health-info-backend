const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { User } = require('../models');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, [user.id, user.nick]);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id },
    })
      .then(user => done(null, user))
      .catch(err => done(err));
  });

  local();
  kakao();
};
