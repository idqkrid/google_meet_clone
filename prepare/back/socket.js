const express = require("express");
const http = require("http");
const SocketIO = require("socket.io");
const app = express();
const cors = require("cors");


const SocketConnect = () => {
  app.use(
    cors({
      //origin: ["http://13.125.251.86:3000"],
      origin: true,
      credentials: true,
    })
  );
  
  const httpServer = http.createServer(app);
  const wsServer = SocketIO(httpServer);
  
  wsServer.on("connection", (socket) => {
    socket.on("join_room", (roomName) => {
      console.log('Joining room: ' + roomName);
      socket.join(roomName);
      socket.to(roomName).emit("welcome");
    });
    socket.on("offer", (offer, roomName) => {
      console.log(roomName)
      socket.to(roomName).emit("offer", offer);
      //socket.emit("offer", offer);
    });
    socket.on("answer", (answer, roomName) => {
      console.log(roomName)
      socket.to(roomName).emit("answer", answer);
      //socket.emit("answer", answer);
    });
    socket.on("ice", (ice, roomName) => {
      console.log(roomName)
      socket.to(roomName).emit("ice", ice);
      //socket.emit("answer", "ice", ice);
    });

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
  });
  

  httpServer.listen(3003, () => {
    console.log(3003, '번 포트 [미디어 서버]에서 대기 중');
  });
}

module.exports = SocketConnect;
