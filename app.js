const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks')
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
const { swaggerUi, specs } = require("./swagger/swagger");
const { isLoggedIn } = require('./routes/middlewares');
const helmet = require('helmet');
const hpp = require('hpp');

dotenv.config();


const authRouter = require('./routes/auth');
const bigpartRouter = require('./routes/bigpart');
const smallpartRouter = require('./routes/smallpart');
const exerciseRouter = require('./routes/exercise');
const commentRouter = require('./routes/comment');
const gifchatRouter = require('./routes/gifchat');

const { sequelize } = require('./models');

const passportConfig = require('./passport');
const logger = require('./logger');
const { globalLimiter } = require('./routes/middlewares');

const app = express();
passportConfig(); // 패스포트 설정
app.set('port', process.env.PORT || 8005);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

sequelize.sync({ force: false })
  .then(async ( ) => {
    console.log('데이터베이스 연결 성공');
      

  })
  .catch((err) => {
    console.error(err);
  });

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(helmet(  { contentSecurityPolicy: false }));
  app.use(hpp());
  app.use(cors({
    origin: ['http://healthinfo.pe.kr'],
    credentials:true,
  }))
} else {
  console.log('here')
  app.use(morgan('dev'));
  app.use(cors());

}
app.use(globalLimiter);
app.use(express.static(path.join(__dirname, 'public')));
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
    domain: process.env.NODE_ENV === 'production' && '.healthinfo.pe.kr'
  },
  name: 'session-cookie', // 디폴트 네임은 connect.sid
};
if (process.env.NODE_ENV === 'production') {
  sessionOption.proxy = true;
  // sessionOption.cookie.secure = true;
}
const sessionMiddleware = session(sessionOption);
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))
app.use('/auth', authRouter);
app.use(isLoggedIn);
app.use('/gifchat', gifchatRouter);
app.use('/bigpart', bigpartRouter);
app.use('/smallpart', smallpartRouter)
app.use('/exercise', exerciseRouter);
app.use('/comment', commentRouter);
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

module.exports = { app, sessionMiddleware };
