const express = require("express");
const http = require("http");
const SocketIO = require("socket.io");
const app = express();
const cors = require("cors");
const fs = require('fs');
const path = require('path');

const SocketChatConnect = () => {
  app.use(
    cors({
      //origin: ["http://13.125.251.86:3000"],
      origin: true,
      credentials: true,
    })
  );

  try {
    fs.accessSync("uploads");
  } catch (error) {
    console.log("uploads 폴더가 없으므로 생성합니다.");
    fs.mkdirSync("uploads");
  }
  
  const httpServer = http.createServer(app);
  const wsServer = SocketIO(httpServer);
  
  wsServer.on("connection", (socket) => {
    socket.on('join_room', (data) => {
      socket.join(data);
    })

    socket.on("send_message", (data) => {
      socket.to(data.room).emit("receive_message",data);
    });

    socket.on("send_message_img", (data) => {
      console.log(data);

      const uploadDir = 'uploads';

      const imageName = `image_${Date.now()}.png`; // 이미지 파일명 생성
      const imagePath = path.join(__dirname, uploadDir, imageName);

      fs.writeFileSync(imagePath, data.message);

      const messageData = {
        room: data?.room,
        author: data?.author,
        message: '이미지',
        img: `${imageName}`, // image_1712945493798.png
        time: data?.time,
      };
      
      console.log(messageData)
      
      // socket.to(data.room).emit("receive_message", messageData);
      socket.emit("receive_message_img", messageData);
    })

    socket.on('disconnect', function() {
      // 소켓이 속한 방의 목록을 가져옴
      const rooms = Object.keys(socket.rooms);
      
      // "join_room"을 통해 참여한 방이 있다면 해당 방에서 소켓을 제거
      rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
          console.log('방을 떠났습니다:', room);
        }
      });

      // 방에 속한 소켓이 없으면 방을 제거
      rooms.forEach(room => {
        const clientsInRoom = wsServer.sockets.adapter.rooms[room];
        if (clientsInRoom && clientsInRoom.size === 0) {
          console.log('방이 비었습니다:', room);
          // 방을 제거
          delete wsServer.sockets.adapter.rooms[room];
        }
      });
    });
    // 채팅 끝
  });
  

  httpServer.listen(3004, () => {
    console.log(3004, '번 포트 [채팅 서버]에서 대기 중');
  });
}

module.exports = SocketChatConnect;
