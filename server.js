const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("Nuevo cliente:", socket.id);

  socket.on("join", (room) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(room) || []);
    const otherClient = clients.find(id => id !== socket.id);

    socket.join(room);
    if (otherClient) {
      socket.emit("joined", otherClient);
    }
  });

  socket.on("signal", ({ to, data }) => {
    if (to) {
      io.to(to).emit("signal", { from: socket.id, data });
    } else {
      // Enviar a todos menos al remitente
      socket.broadcast.emit("signal", { from: socket.id, data });
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
