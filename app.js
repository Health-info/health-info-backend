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

sequelize.sync({ force: true })
  .then(async ( ) => {
    console.log('데이터베이스 연결 성공');
    await sequelize.query("INSERT INTO bigparts (name) VALUES ('어깨'), ('하체'), ('가슴'), ('등'), ('코어'), ('팔')");
    await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (1, '전면'), (1, '측면'), (1, '후면')")
    await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (2, '대퇴사두'), (2, '대퇴이두'), (2, '둔근'), (2, '비복근')")
    await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (3, '상부'), (3, '중부'), (3, '하부')")
    await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (4, '상부승모'), (4, '중앙승모'), (4, '광배상부'), (4, '광배하부'), (4, '기립근')")
    await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (5, '코어')")
    await sequelize.query("INSERT INTO smallparts (BigpartId, name) VALUES (6, '전완근'), (6, '이두'), (6, '삼두')")
  
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (1, '숄더 프레스란 어깨의 근육을 이용해 미는(press)운동입니다.','Shoulder Press')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (1, '기립한 채로 기구를 머리 위로 들어올리는 동작이기 때문에 주동근인 삼각근의 개발뿐만 아니라 전신의 협응력이 필요한 복합 운동.',' Overhead press')")
  
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (2, '사이드 레터럴 레이즈란 삼각근 전체 및 삼두를 단련시키는. 복합 운동이 아닌 고립 운동.','Side lateral raise')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (2, '승모근과 삼각근을 주로 사용하는 운동이다. 바벨이나 덤벨, 케이블, 스미스 머신을 사용할 수 있으며 동작에 변형을 줘서 주로 자극되는 근육 부위를 다르게 할 수 있다','Upright Row')")
    
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (3, '상체를 숙이고 덤벨을 양옆으로 올리면서 삼각근을 자극하는 운동입니다','Bent-over lateral raise')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (3, '페이스풀(Face Pull)이란 로프를 이용해서 얼굴 쪽으로 (Face) 당기는 (Pull) 운동이에요.','face pull')")
  
    
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (4, '스쿼트는 웨이트 트레이닝의 종류로 무릎 관절을 굽혔다 펴는 행동을 반복함으로써, 하체의 근력을 길러주는 운동입니다','Squat')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (4, '런지란 다리를 앞뒤로 쪼갠 자세( Split pattern)에서 한 다리씩 하는 편측 운동.','lunge')");
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (4, '정확히 대퇴사두근, 대둔근, 중둔근을 단련하기 위한 운동중에 하나이다','leg press')");
    
  
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (5, '레그컬이란 다리의 후면부, 햄스트링을 단련하는 운동이다.','LyingLegCurl')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (5, '스티프 레그 데드리프트란 햄스트링과 둔근의 발달을 목적으로 협력근으로써 척추기립근과 대퇴사두근을 발달 시킬 수 있다..','Stiff-Leg Deadlift')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (5,'허리디스크로 인해 스쿼트 같은 복합 근력운동이불가능 한 사람에게 효과적인 운동이다.','V sqaut')")
  
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (6, '글루트브리지란 둔근,슬괵근 강화를 통한 힙업을 통해 척추기립근을강화해주는 운동이다','Glute bridges')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (6, '엉덩이 운동은 물론이며 동시에 하체를 단련할수 있고 코어근력에 상당히 도움이 되는 운동이다.','Hip Thrust')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (6, '몬스터 워크 운동은 고관절 굴곡근과 신전근, 외전근 등을 사용하여 고관절을 둘러싼 근육의 힘을 길러준다.','Monster walks')")

    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (7, '스탠딩 카프레이즈란 비복근(종아리 안쪽)을 강화해주는 운동이다','Standing Calf Raise')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (7, '시티드 카프레이즈는 가자미근 (종아리바깥근육)을 자극하는 운동이다.','Seated Calf Raise')")
  
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (8, '인클라인 벤치 프레스(Incline Bench Press)[편집] 평평한 벤치가 아닌 사진처럼 비스듬히 세워진 벤치에서 실시한다. 가슴 상부 근육을 좀 더 집중적으로 발달시키는 운동이다','Incline bench press')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (8, '길로틴 벤치프레스란 벤치프레스의 변형 운동으로서 바벨을 목라인까리 내리는 운동이고, 이 운동의 목적은 상부가슴에 초점을 맞추는 것이다.','Guillotine Bench Press')")
   
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (9, '케이블 크로스 오버는 자유로운 범위로 수행 할수 있어 가슴을 제대로 자극할수있는 운동이다.  다양한 자세와 동작으로 부위를 골고루 자극하기도 좋다','Cable CrossOver')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (9, '팔굽혀펴기 또는 푸쉬업(영어: push-up, press-up, floor-dip)은 대표적인 근력 운동 중 하나이다. 일반적으로 기구 등을 사용하지 않고 할 수 있는 운동으로, 엎드린 상태에서 전신의 체중을 두 손과 두 발가락의 4개소에 집중하여 양팔을 늘리는 힘에 의해 신체를 올린다.','push-ups')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (9, '덤벨 프레스는 양 손에 덤벨을 들고 할 수 있는 가슴 운동이다. 벤치프레스와 자세는 비슷하나 양 팔이 각자 무게를 지탱해야 한다는 점에서 차이가 있다.','Dumbbell Press')")

    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (10, '딥스는 평행봉을 양손으로 잡고 팔의 힘과 팔꿈치의 힘으로 상하로 움직이는 운동입니다. 얼핏 보기에는 팔의 근육이 중점적으로 움직여 팔운동으로 생각되기 쉽지만, 사실은 가슴 하부에 좋은 아랫가슴 운동이다','Dips')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (10, '인클라인 푸쉬업은 아랫가슴 운동 중 난이도가 가장 낮은 트레이닝 이다. 의자와 벤치처럼 높이가 있는 기구를 사용하며, 근력이 충분하지 않는 초보자들도 무난하게 실시할 수 있는 운동이다','Incline Push-Up)')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (10, '대표적인 가슴운동 벤치 프레스를 낮은 각도로 실시하면 디클라인이 됩니다. 디클라인 벤치 프레스는 높은 강도로 수행할 수 있는 아랫가슴 운동가장 무거운 중량, 가장 큰 에너지를 소비할 수 있다.','Decline Bench Press')")

    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (11, '업라이트 로우는 어깨를 전체적으로 발달시켜줄수 있는 운동이다. 주 자극부분은 승모근의 상부 부근이지만 삼각근의 측면발달에도 도움이 될수 있는 어깨운동이다.','Upright Row')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (12, '슈러그는 어깨를 으쓱이는 단순한 운동이다. 하지만 승모의 수축과 이완을 적극적으로 사용하는 운동이라 모든 구간에서 일정한 속도와 힘을 유지하며 중량을 완벽히 통제할 수 있다면 뭉친 상부를 이완시키고 약한 하부는 강하게 해 승모 전체의 균형을 도모할 수 있다.','Shrug')")
    
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (13, '풀업은 상체를 집중적으로 가꿀 수 있는 운동으로써 군살을 제거하고 역삼각형 라인을 만드는 데 도움을 주는 운동이다. 등 근육을 담당하는 광배근과 어깨 근육, 가슴 근육, 팔의 이두 및 삼두근, 복부 근육까지 발달시키며, 두툼한 가슴과 넓은 어깨를 만들 수 있다.','Pull up')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (13, '턱걸이를 하듯 어깨보다 좀 더 넓게 바를 잡은 다음, 상체를 뒤로 젖히고 팔이 아니라 등의 힘으로 당겨 내려오는 방식이 가장 기본적인 형태이다.','Behind Lat Pull Down)')")



    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (14, '무거운 중량을 버티는 등, 허리의 안정화와 하체 근육 단련에 효과적이다. 근력과 순발력 훈련도 된다. 많은 근육이 동시에 사용돼 신진대사 활성화를 촉진한다. 지방 감량에 효과적이다. ','Deadlift')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (14, '바벨을 이용하여 로잉하는 운동방법을 말한다. Row = 로우, 노젓기와 비슷한 원리, 허리숙여하는 동작으로, 벤트오버 바벨로우라고 라고한다.','barbell row')")

    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (15, '슈퍼맨 운동 효과는 허리(척추 기립근)를 강화시키고, 엉덩이를 자극해 쳐진 힙을 업을 시킬 수 있는 운동입니다.','Superman back extension')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (15, '플랭크 운동이란 평평한 땅과 건강한 신체만 있으면 할 수 있는 대표적인 맨몸운동으로 엎드린 채로 올곧은 자세를 유지하는 것이 특징입니다.','Planks')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (15, '마운틴 클라이머는 전신 운동으로써 몸 전체를 자극하여 다양한 근육을 운동시키며, 군살을 제거하고 탄탄한 몸매를 만드는 데 도움을 주는 운동으로. 어깨와 팔을 포함하여 코어, 다리 등의 여러 근육을 단련시키고, 체력 수준을 끌어 올릴 수 있다.','Mountain Climber')")
    

    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (16, 'Wrist Curl 은 전완근 전체를 자극하는 운동이다. 최대효과를 위해서는 전체범위로 훈련하는 것이 좋다.','Wrist Curl')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (17, '아령(덤벨)을 들고 팔을 굽히는 운동이다. 주 타격부위는 이두근이며 보조로 삼각근 전면과 전완근이 쓰인다. 바벨 컬이 사이즈를 키우는데 더 유리한 운동이라면 덤벨 컬은 양쪽 이두근의 균형잡힌 발달과 높은 범용성의 장점이 있다.','Dumbbell Curl')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (17, '해머컬이란 상완이두근중 장두를 특히 더 발달시킬수 있는 운동이다. 전완근 또한 협응근으로써 쓰입니다.','Hammer Curl')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (17, '케이블 컬은 컨센트레이션 컬 다음으로 이두근의 활성도가 높은 운동이다. 80%의 근 활성도를 나타내는 운동으로 최대한 너무 높지 않은 중량으로 쥐어짜듯이 운동하면 효과적이고, 고강도의 바벨 덤벨 운동 후 마무리 운동으로 넣어주면 아주 좋은 이두운동이 된다','Cable curl ')")

    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (18, '라잉트라이셉스익스텐션 (Lying triceps extention)은 ​상완 삼두근 전체에 가장 효과적인 운동이다. 팔꿈치에서 부터 활배근(광배근)까지 전체를 이완, 수축시키면서도 하나의 관절만 이용하는 단관절운동으로삼두의 불균형을 개선할 수 있으며, 보디빌딩에서는 삼두근을 강화하기 위한 목적으로 이용된다. ','lying triceps extension')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (18, '덤벨 킥백 운동법은 삼두근을 집중적으로 자극할 수 있는 운동이다. 덤벨은 1개만 사용하고, 몸통을 받칠 고정 의자도 준비되어 있어야 수월하게 운동을 할 수 있다. ','Dumbell kick back')")
    await sequelize.query("INSERT INTO exercises (SmallpartId, description,name) VALUES (18, '이 운동은 상완삼두근(팔 뒤쪽근육)장두를 집중적으로 강화하는 효과가 있으며 동작 시 근육이 수축하면서 상완삼두근 부위 전체가 효과적으로 단련된다.','Seated Dumbbell Triceps Extension')")
    
    

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

app.use('/gif', express.static(path.join(__dirname, 'uploads')));
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
app.use('/image',express.static(path.join(__dirname, 'images')));
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
