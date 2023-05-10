const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let players = [];
let food = {};
let gameLoopIntervalId;
let visualConfigs = {
  subTitle: "Waiting for players...",
  startGameButtonOn: "block",
  GameOverMessageContainerOn: "none",
  gameInstructionsOn: "block",
};

function verifyPlayersReady() {
  let playersReady = 0;
  players.forEach((player) => {
    console.log(player);
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
  // console.log("Spawnou comida em x: " + food.x + " y: " + food.y);
}

function updateGame() {
  // Move players
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
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
    // console.log(player.id + " -  x: " + player.x + " y: " + player.y);

    // Check if player collided with a food
    if (player.x === food.x && player.y === food.y) {
      player.score++;
      spawnFood();
      io.emit("updatePlayersScore", players);
      io.emit("updateFood", food);
    }
  }

  // Send game state to all clients
  io.emit("gameState", { players, food });
}

io.on("connection", (socket) => {
  console.log(`Player ${socket.id} connected`);
  io.emit("visualConfigs", visualConfigs);

  // Add new player
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
  // console.log("Entrou mais um player, agora temos: " + players.length);

  // Send initial game state to new player
  socket.emit("init", { player, players, food });

  // Update player direction
  socket.on("playerMove", (direction) => {
    for (let i = 0; i < players.length; i++) {
      if (players[i].id === socket.id) {
        players[i].direction = direction;
        break;
      }
    }
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

  socket.on("userReady", (userData) => {
    players.forEach((player) => {
      if (player.id === socket.id) {
        player.name = userData.username;
        player.color = userData.usercolor;
        player.userReady = true;
        console.log(player);
      }
    });
  });

  socket.on("gameStart", () => {
    // Start game when there are at least two players
    let playersReady = verifyPlayersReady();
    console.log("Players ready: " + playersReady);
    if (playersReady >= 2 && !gameLoopIntervalId) {
      console.log("More than 2 players, starting game");

      visualConfigs.subTitle = "Game started!";
      visualConfigs.startGameButtonOn = "none";
      visualConfigs.GameOverMessageContainerOn = "none";
      visualConfigs.gameInstructionsOn = "none";

      io.emit("visualConfigs", visualConfigs);

      initGame();

      io.emit("gameStart", { players, food });
      io.emit("playersScore", players);
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}/`);
});
