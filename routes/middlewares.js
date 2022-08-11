const RateLimit = require('express-rate-limit');

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send('로그인 필요');
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent('로그인한 상태입니다.');
    res.redirect(`/?error=${message}`);
  }
};

exports.mailLimiter = RateLimit({
  windowMs: 60 * 1000, // 1분
  max: 1,
  delayMs: 0,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode, // 기본값 429
      message: '1분에 한 번만 발송할 수 있습니다.',
    });
  },
});

exports.authNumCheckLimiter = RateLimit({
  windowMs: 60 * 1000, // 1분
  max: 30,
  delayMs: 2 * 1000, // 초
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode, // 기본값 429
      message: '1분에 최대 30번 요청 가능합니다..',
    });
  },
});

exports.globalLimiter = RateLimit({
  windowMs: 60 * 1000, // 1분
  max: 100,
  delayMs: 100,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode, // 기본값 429
      message: '디도스 공격 금지입니다..',
    });
  },
});

