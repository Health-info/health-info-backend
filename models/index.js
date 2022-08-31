const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('./user');
const Comment = require('./comment');
const Bigpart = require('./bigpart');
const Smallpart = require('./smallpart');
const Exercise = require('./exercise');
const Image = require('./image');
const Domain = require('./domain');
const Room = require('./room');
const Chat = require('./chat');

const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Comment = Comment;
db.Bigpart = Bigpart;
db.Smallpart = Smallpart;
db.Exercise = Exercise;
db.Image = Image;
db.Domain = Domain;
db.Room = Room;
db.Chat = Chat;

User.init(sequelize);
Comment.init(sequelize);
Bigpart.init(sequelize);
Smallpart.init(sequelize);
Exercise.init(sequelize);
Image.init(sequelize);
Domain.init(sequelize);
Room.init(sequelize);
Chat.init(sequelize);

User.associate(db);
Comment.associate(db);
Bigpart.associate(db);
Smallpart.associate(db);
Exercise.associate(db);
Image.associate(db);
Domain.associate(db);
Room.associate(db);
Chat.associate(db);

module.exports = db;
