const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
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

const { sequelize } = require('./models');
const passportConfig = require('./passport');
const logger = require('./logger');
const { globalLimiter } = require('./routes/middlewares');

const app = express();
passportConfig(); // 패스포트 설정
app.set('port', process.env.PORT || 8001);

sequelize.sync({ force: true })
  .then(async ( ) => {
    console.log('데이터베이스 연결 성공');
      
  await sequelize.query("INSERT INTO bigparts (name) VALUES ('어깨'), ('하체'), ('가슴'), ('등'), ('코어'), ('복근'), ('팔')");
    
  await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (1, '전면'), (1, '측면'), (1, '후면')")
  await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (2, '대퇴사두'), (2, '대퇴이두'), (2, '둔근'), (2, '비복근')")
  await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (3, '상부'), (3, '중부'), (3, '하부')")
  await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (4, '상부승모'), (4, '중앙승모'), (4, '광배상부'), (4, '광배하부'), (4, '기립근')")
  await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (5, '코어')")
  await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (6, '복직근'), (6, '외복사근'), (6, '내복사근'), (6, '복횡근')")
  await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (7, '전완근'), (7, '이두'), (7, '삼두')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (1, '숄더 프레스란 어깨의 근육을 이용해 미는(press)운동입니다.','Shoulder Press')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (1, '기립한 채로 기구를 머리 위로 들어올리는 동작이기 때문에 주동근인 삼각근의 개발뿐만 아니라 전신의 협응력이 필요한 복합 운동.',' Overhead press')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (2, '사이드 레터럴 레이즈란 삼각근 전체 및 삼두를 단련시키는. 복합 운동이 아닌 고립 운동.','Side lateral raise')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (2, '승모근과 삼각근을 주로 사용하는 운동이다. 바벨이나 덤벨, 케이블, 스미스 머신을 사용할 수 있으며 동작에 변형을 줘서 주로 자극되는 근육 부위를 다르게 할 수 있다','Upright Row')")
  
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (3, '상체를 숙이고 덤벨을 양옆으로 올리면서 삼각근을 자극하는 운동입니다','Bent-over lateral raise')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (3, '페이스풀(Face Pull)이란 로프를 이용해서 얼굴 쪽으로 (Face) 당기는 (Pull) 운동이에요.','face pull')")

  
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (4, '스쿼트는 웨이트 트레이닝의 종류로 무릎 관절을 굽혔다 펴는 행동을 반복함으로써, 하체의 근력을 길러주는 운동입니다','Squat')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (4, '런지란 다리를 앞뒤로 쪼갠 자세( Split pattern)에서 한 다리씩 하는 편측 운동.','lunge')");
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (4, '정확히 대퇴사두근, 대둔근, 중둔근을 단련하기 위한 운동중에 하나이다','leg press')");
  

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (5, '먼저 레그컬이란 다리의 후면부, 햄스트링을 단련하는 운동이다.','LyingLegCurl')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (5, '스티프 레그 데드리프트란 햄스트링과 둔근의 발달을 목적으로 협력근으로써 척추기립근과 대퇴사두근을 발달 시킬 수 있다..','Stiff-Leg Deadlift')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (5,'허리디스크로 인해 스쿼트 같은 복합 근력운동이불가능 한 사람에게 효과적인 운동이다.','V sqaut')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (6, '','Glute bridges')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (7, '','Calf Raise')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (8, '','Incline bench press')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (9, '','Cable CrossOver')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (10, '','Dips')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (11, '','Upright Row')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (12, '','Shrug')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (13, '','Pull up')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (14, '','Deadlift')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (15, '','Superman back extension')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (16, '','Planks')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (17, '','Reverse Crunch')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (18, '','Side band')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (19, '','Bicycle Crunch')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (20, '','Dead bug')")

  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (21, '','Wrist Curl')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (22, '','Dumbbell Curl')")
  await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (23, '','lying triceps extension')")
  
  })
  .catch((err) => {
    console.error(err);
  });

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(helmet(  { contentSecurityPolicy: false }));
  app.use(hpp());
} else {
  app.use(morgan('dev'));
}

app.use(cors({
  origin: ['http://healthinfo.pe.kr'],
  credentials:true,
}))
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
    domain: process.env.NODE_ENV === 'production' && '.healthinfo.pe.kr'
  },
};
if (process.env.NODE_ENV === 'production') {
  sessionOption.proxy = true;
  // sessionOption.cookie.secure = true;
}

app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))
app.use('/auth', authRouter);
app.use(isLoggedIn);
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

module.exports = app;
