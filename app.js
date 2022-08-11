const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require('cors');
const { swaggerUi, specs } = require('./swagger/swagger');
const passport = require('passport');
const helmet = require('helmet');
const hpp = require('hpp');

dotenv.config();


const authRouter = require('./routes/auth');

const { sequelize } = require('./models');
const passportConfig = require('./passport');
const logger = require('./logger');
const { globalLimiter } = require('./routes/middlewares');

const app = express();
passportConfig(); // 패스포트 설정
app.set('port', process.env.PORT || 8001);

sequelize.sync({ force: true })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(helmet());
  app.use(hpp());
} else {
  app.use(morgan('dev'));
}

app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
};
if (process.env.NODE_ENV === 'production') {
  sessionOption.proxy = true;
  // sessionOption.cookie.secure = true;
}
app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({origin: true, credentials: true}));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))
app.use('/auth', authRouter);


app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  logger.info('hello');
  logger.error(error.message);
  next(error);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500);
  res.end(err.message)
});

module.exports = app;
