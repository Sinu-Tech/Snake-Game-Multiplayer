const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let players = [];
let foods = [];
let gameLoopIntervalId;

function initGame() {
  players = [];
  foods = [];
  clearInterval(gameLoopIntervalId);

  // Initialize foods
  for (let i = 0; i < 20; i++) {
    spawnFood();
  }

  // Start game loop
  gameLoopIntervalId = setInterval(updateGame, 100);
}

function spawnFood() {
  const food = {
    x: Math.floor(Math.random() * 39) + 1,
    y: Math.floor(Math.random() * 39) + 1,
  };
  foods.push(food);
}

function updateGame() {
  // Update player positions
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    switch (player.direction) {
      case "up":
        player.y--;
        break;
      case "down":
        player.y++;
        break;
      case "left":
        player.x--;
        break;
      case "right":
        player.x++;
        break;
    }

    // Check if player collided with a food
    for (let j = 0; j < foods.length; j++) {
      const food = foods[j];
      if (player.x === food.x && player.y === food.y) {
        // Remove food
        foods.splice(j, 1);

        // Increase player score
        player.score++;

        // Spawn new food
        spawnFood();
        break;
      }
    }
  }

  // Send game state to all clients
  io.emit("gameState", { players, foods });
}

io.on("connection", (socket) => {
  console.log(`Player ${socket.id} connected`);

  // Add new player
  const player = {
    id: socket.id,
    x: Math.floor(Math.random() * 39) + 1,
    y: Math.floor(Math.random() * 39) + 1,
    direction: "right",
    score: 0,
  };
  players.push(player);

  // Send initial game state to new player
  socket.emit("init", { player, players, foods });

  // Update player direction
  socket.on("updateDirection", (direction) => {
    for (let i = 0; i < players.length; i++) {
      if (players[i].id === socket.id) {
        players[i].direction = direction;
        break;
      }
    }
  });

  // Remove player on disconnect
  socket.on("disconnect", () => {
    console.log(`Player ${socket.id} disconnected`);
    for (let i = 0; i < players.length; i++) {
      if (players[i].id === socket.id) {
        players.splice(i, 1);
        break;
      }
    }
  });

  // Start game when there are at least two players
  if (players.length >= 2 && !gameLoopIntervalId) {
    initGame();
  }
});

http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});