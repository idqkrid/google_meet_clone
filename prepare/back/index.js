const express = require('express');
const path = require('path');
const connect = require('./schemas');
const usersRouter = require('./router/users');
const cookieParser = require('cookie-parser');
const cors = require("cors");

const app = express();

const SocketConnect = require('./socket')
const SocketChatConnect = require('./socket_chat')

connect();
SocketConnect();
SocketChatConnect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    //origin: true,
    credentials: true
  })
);

app.use('/users', usersRouter);

server = app.listen(3001, () => {
  console.log(3001, '번 포트 [API 서버]에서 대기 중');
});