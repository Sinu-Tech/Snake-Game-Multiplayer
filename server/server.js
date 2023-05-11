const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 3000;
app.use(express.static("public"));

// Game objects
let players = [];
let food = {};
let gameLoopIntervalId;

// Function to verify how many players are ready
function getCountPlayersReady() {
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
  generateFoodPosition();

  // Start game loop
  gameLoopIntervalId = setInterval(updateGame, 100);
}

function generateFoodPosition() {
  food = {
    x: Math.floor(Math.random() * 39) + 1,
    y: Math.floor(Math.random() * 39) + 1,
  };
}

function updateGame() {
  // Move players position
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
      generateFoodPosition();
      io.emit("updatePlayersScore", players);
      io.emit("updateFoodPosition", food);
    }
  });

  // Send game state to all clients
  io.emit("updatePlayersPosition", players);
}

io.on("connection", (socket) => {
  // Add new player to the server data
  let player = {
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

  // Remove player on disconnect
  socket.on("disconnect", () => {
    for (let i = 0; i < players.length; i++) {
      if (players[i].id === socket.id) {
        players.splice(i, 1);
        break;
      }
    }
  });

  // Update player direction
  socket.on("playerPressedDirection", (direction) => {
    for (let i = 0; i < players.length; i++) {
      if (players[i].id === socket.id) {
        players[i].direction = direction;
        break;
      }
    }
  });

  // Get player name and color and set player as ready
  socket.on("userReady", (userData) => {
    for (let i = 0; i < players.length; i++) {
      if (players[i].id === socket.id) {
        players[i].name = userData.username;
        players[i].color = userData.usercolor;
        players[i].userReady = true;
        break;
      }
    }
  });

  socket.on("gameStart", () => {
    let countPlayersReady = getCountPlayersReady();

    // Game Start Condition
    if (
      ((countPlayersReady == players.length && countPlayersReady >= 2) ||
        countPlayersReady >= 4) &&
      !gameLoopIntervalId
    ) {
      initGame();

      io.emit("gameStart", { players, food });
      io.emit("createPlayersScore", players);
    }
  });
});

// Start server
http.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}/`);
});
