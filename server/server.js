const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 3000;
app.use(express.static("public"));

let players = [];
let food = {};
let gameLoopIntervalId;

function verifyPlayersReady() {
  let playersReady = 0;
  players.forEach((player) => {
    if (player.userReady) {
      playersReady++;
    }
  });
  return playersReady;
}

function initGame() {
  clearInterval(gameLoopIntervalId);
  spawnFood();

  // Start game loop
  gameLoopIntervalId = setInterval(updateGame, 100);
}

function spawnFood() {
  food = {
    x: Math.floor(Math.random() * 39) + 1,
    y: Math.floor(Math.random() * 39) + 1,
  };
}

function updateGame() {
  // Move players
  players.forEach((player) => {
    switch (player.direction) {
      case "up":
        if (player.y != 0) player.y--;
        break;
      case "down":
        if (player.y != 39) player.y++;
        break;
      case "left":
        if (player.x != 0) player.x--;
        break;
      case "right":
        if (player.x != 39) player.x++;
        break;
    }

    // Check if player collided with a food
    if (player.x === food.x && player.y === food.y) {
      player.score++;
      spawnFood();
      io.emit("updatePlayersScore", players);
      io.emit("updateFoodPosition", food);
    }
  });

  // Send game state to all clients
  io.emit("gameState", { players, food });
}

io.on("connection", (socket) => {
  // console.log(`Player ${socket.id} connected`);

  // Add new player to the server data
  const player = {
    id: socket.id,
    x: Math.floor(Math.random() * 39) + 1,
    y: Math.floor(Math.random() * 39) + 1,
    direction: "",
    score: 0,
    name: "",
    color: "",
    userReady: false,
  };
  players.push(player);

  // Update player direction
  socket.on("playerMove", (direction) => {
    players.forEach((player) => {
      if (player.id === socket.id) {
        player.direction = direction;
      }
    });
  });

  // Remove player on disconnect
  socket.on("disconnect", () => {
    // console.log(`Player ${socket.id} disconnected`);
    for (let i = 0; i < players.length; i++) {
      if (players[i].id === socket.id) {
        players.splice(i, 1);
        break;
      }
    }
  });

  // Get player name and color and set player as ready
  socket.on("userReady", (userData) => {
    players.forEach((player) => {
      if (player.id === socket.id) {
        player.name = userData.username;
        player.color = userData.usercolor;
        player.userReady = true;
      }
    });
  });

  socket.on("gameStart", () => {
    let playersReady = verifyPlayersReady();

    // Start game when there are at least two players ready
    if (
      playersReady == players.length &&
      playersReady >= 2 &&
      !gameLoopIntervalId
    ) {
      initGame();

      io.emit("gameStart", { players, food });
      io.emit("playersScore", players);
    }
  });
});

// Start server
http.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}/`);
});
