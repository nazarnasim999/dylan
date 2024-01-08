const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app); // Create an HTTP server
const socketIo = require("socket.io");

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: "*",
  },
}); // Initialize socket.io

io.on("connection", (socket) => {
console.log("running");
  console.log(socket.id);
  console.log('A user connected');



  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
    console.log("message", data);
  });

  
});

module.exports = { app, server, io };
