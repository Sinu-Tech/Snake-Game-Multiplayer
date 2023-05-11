const socket = io();

// Saving all the DOM elements in variables
const body = document.getElementById("body");
const gameArea = document.getElementById("game-area");
const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.getElementById("game-score-container");
const gameInstructions = document.getElementById("game-instructions");
const startGameBtn = document.getElementById("start-game-btn");
const playerReadyBtn = document.getElementById("player-ready-btn");
const userFormData = document.getElementById("user-form-data");

// Game variables
let gameActive = false;

// Listen for start game button click
startGameBtn.addEventListener("click", () => {
  socket.emit("gameStart");
});

playerReadyBtn.addEventListener("click", () => {
  let username = document.getElementById("username").value;
  if (username === "") {
    alert("Digite um nome de usuário");
    return;
  }

  let usercolor = document.getElementById("usercolor").value;
  let userReady = true;

  let userData = {
    username: username,
    usercolor: usercolor,
    userReady: userReady,
  };

  socket.emit("userReady", userData);
  gameArea.style.display = "flex";
  document.getElementById("user-form-data").style.display = "none";
});

// Listen for keydown events to move the player
document.addEventListener("keydown", (event) => {
  if (gameActive) {
    if (event.key === "a" || event.key === "A" || event.key === "ArrowLeft") {
      socket.emit("playerMove", "left");
    } else if (
      event.key === "w" ||
      event.key === "W" ||
      event.key === "ArrowUp"
    ) {
      socket.emit("playerMove", "up");
    } else if (
      event.key === "d" ||
      event.key === "D" ||
      event.key === "ArrowRight"
    ) {
      socket.emit("playerMove", "right");
    } else if (
      event.key === "s" ||
      event.key === "S" ||
      event.key === "ArrowDown"
    ) {
      socket.emit("playerMove", "down");
    }
  }
});

// Listen for updates from the server
socket.on("gameStart", handleGameStart);
socket.on("gameState", handleGameState);
socket.on("playersScore", handlePlayersScore);
socket.on("updatePlayersScore", handleUpdatePlayersScore);
socket.on("updateFood", handleUpdateFood);

// Placar de todos os jogadores
function handlePlayersScore(players) {
  console.log("Entrou na função handlePlayersScore");

  players.forEach((player) => {
    createPlayerScore(player.id, player.name, player.color);
  });
}

// Function to handle update players score
function handleUpdatePlayersScore(players) {
  console.log("Entrou na função updateScore");

  players.forEach((player) => {
    updatePlayerScore(player.id, player.name, player.score);
  });
}

// Function to initialize the game board
function handleGameStart(gameState) {
  console.log("Entrou na função gameStart cliente");
  gameActive = true;

  document.getElementById("game-score-container").style.visibility = "visible";
  // Create the initial player and food element
  for (let i = 0; i < gameState.players.length; i++) {
    createPlayer(gameState.players[i]);
  }
  createFood(gameState.food);
}

// Function to uptade food position
function handleUpdateFood(food) {
  updateFood(food);
}

// Function to handle the gameState event from the server
function handleGameState(gameState) {
  gameState.players.forEach((player) => {
    updatePlayer(player);
  });
}

// Function to create a playerScore element
function createPlayerScore(playerId, playerName, playerColor) {
  const newScorePlayer = document.createElement("p");
  newScorePlayer.className = "score score-" + playerId;
  newScorePlayer.style.color = playerColor;
  newScorePlayer.innerText = playerName + ": 0";
  scoreDisplay.appendChild(newScorePlayer);
}

// Function to update a player score element
function updatePlayerScore(playerId, playerName, score) {
  const scoreElement = document.querySelector(".score-" + playerId);

  if (scoreElement) {
    scoreElement.innerText = playerName + ": " + score;
  }
}

// Function to create a player element
function createPlayer(player) {
  const newPlayer = document.createElement("div");
  newPlayer.className = "player player-" + player.id;
  newPlayer.style.top = player.y * 20 + "px";
  newPlayer.style.left = player.x * 20 + "px";
  newPlayer.style.border = "1px solid black";
  newPlayer.style.backgroundColor = player.color;
  gameBoard.appendChild(newPlayer);
}

// Function to update a player position element
function updatePlayer(player) {
  const playerElement = document.querySelector(".player-" + player.id);
  if (playerElement) {
    playerElement.style.top = player.y * 20 + "px";
    playerElement.style.left = player.x * 20 + "px";
  }
}

// Function to create a food element
function createFood(food) {
  console.log("Entrou na função createFood");
  const newFood = document.createElement("div");
  newFood.className = "food";
  newFood.style.top = food.y * 20 + "px";
  newFood.style.left = food.x * 20 + "px";

  const foodImg = document.createElement("img");
  foodImg.src = "../assets/imgs/food-img.png";
  foodImg.style.width = "20px";
  foodImg.style.height = "20px";
  newFood.appendChild(foodImg);
  gameBoard.appendChild(newFood);
}

// Function to update a food element
function updateFood(food) {
  console.log("Entrou na função updateFood");
  const foodElement = document.querySelector(".food");
  if (foodElement) {
    foodElement.style.top = food.y * 20 + "px";
    foodElement.style.left = food.x * 20 + "px";
  }
}
