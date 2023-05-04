const socket = io();

const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.getElementById("game-score-container");
const gameOverDisplay = document.getElementById("game-over-message-container");
const gameInstructions = document.getElementById("game-instructions");
const startGameBtn = document.getElementById("start-game-btn");
const body = document.getElementById("body");

let gameActive = false;
let playerScore = 0;
let gameState;

document.getElementById("game-over-message-container").style.display = "none";

// Listen for start game button click
startGameBtn.addEventListener("click", () => {
  socket.emit("gameStart");
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
socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("playersScore", handlePlayersScore);
socket.on("updatePlayersScore", handleUpdatePlayersScore);
socket.on("gameStart", handleGameStart);
socket.on("visualConfigs", handleVisualConfigs);
socket.on("updateFood", handleUpdateFood);
// socket.on("gameAborted", handleGameAborted);
// socket.on("gameOver", handleGameOver);

function handleVisualConfigs(configs) {
  console.log("Entrou na função handleVisualConfigs");
  document.getElementById("sub-title").innerHTML = configs.subTitle;
  document.getElementById("game-instructions").style.display =
    configs.gameInstructionsOn;
  document.getElementById("game-over-message-container").style.display =
    configs.GameOverMessageContainerOn;
  document.getElementById("start-game-btn").style.display =
    configs.startGameButtonOn;
}

// Placar de todos os jogadores
function handlePlayersScore(players) {
  console.log("Entrou na função handlePlayersScore");

  players.forEach((player) => {
    createPlayerScore(player.id);
  });
}

// Function to handle update players score
function handleUpdatePlayersScore(players) {
  console.log("Entrou na função updateScore");

  players.forEach((player) => {
    updatePlayerScore(player.id, player.score);
  });
}

// Function to initialize the game board
function handleGameStart(gameStateMsg) {
  console.log("Entrou na função gameStart cliente");
  gameActive = true;
  gameState = gameStateMsg;

  // Create the initial player and food element
  for (let i = 0; i < gameState.players.length; i++) {
    createPlayer(gameState.players[i]);
  }
  createFood(gameState.food);
}

// Function to handle the init event from the server
function handleInit(msg) {
  console.log("Entrou na função handleInit");
  gameState = msg;
}

// Function to uptade food position
function handleUpdateFood(food) {
  updateFood(food);
}

// Function to handle the gameState event from the server
function handleGameState(gameStateMsg) {
  gameState = gameStateMsg;
  for (let i = 0; i < gameState.players.length; i++) {
    updatePlayer(gameState.players[i]);
  }
}

// Function to create a playerScore element
function createPlayerScore(playerId) {
  console.log("Entrou na função createScore");

  const newScorePlayer = document.createElement("p");
  newScorePlayer.className = "score score-" + playerId;
  newScorePlayer.innerText = playerId + ": 0";
  scoreDisplay.appendChild(newScorePlayer);
}

// Function to update a player score element
function updatePlayerScore(playerId, score) {
  const scoreElement = document.querySelector(".score-" + playerId);

  if (scoreElement) {
    scoreElement.innerText = playerId + ": " + score;
  }
}

// Function to create a player element
function createPlayer(player) {
  console.log("Entrou na função createPlayer");
  const newPlayer = document.createElement("div");
  console.log("Criando jogador id: " + player.id);
  newPlayer.className = "player player-" + player.id;
  newPlayer.style.top = player.y * 20 + "px";
  newPlayer.style.left = player.x * 20 + "px";
  gameBoard.appendChild(newPlayer);
}

// Function to update a player position element
function updatePlayer(player) {
  console.log("Entrou na função updatePlayer");
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
  newFood.style.color = "red";
  newFood.style.top = food.y * 20 + "px";
  newFood.style.left = food.x * 20 + "px";
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
