const socket = io();

const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.querySelector(".score");
const gameOverDisplay = document.getElementById("game-over-message-container");
const gameInstructions = document.getElementById("game-instructions");
const startGameBtn = document.getElementById("start-game-btn");

let playerNumber;
let gameActive = true;
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
    if (event.key === "a") {
      console.log(playerNumber + " moveu para a esquerda");
      socket.emit("playerMove", "left");
    } else if (event.key === "w") {
      console.log(playerNumber + " moveu para cima");
      socket.emit("playerMove", "up");
    } else if (event.key === "d") {
      console.log(playerNumber + " moveu para a direita");
      socket.emit("playerMove", "right");
    } else if (event.key === "s") {
      console.log(playerNumber + " moveu para baixo");
      socket.emit("playerMove", "down");
    }
  }
});

// Listen for updates from the server
socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("playerNumber", handlePlayerNumber);
socket.on("playerScore", handlePlayerScore);
socket.on("gameStart", handleGameStart);
socket.on("gameAborted", handleGameAborted);
socket.on("visualConfigs", handleVisualConfigs);

function handleVisualConfigs(configs) {
  console.log("Entrou na função handleVisualConfigs");
  document.getElementById("sub-title").innerHTML = configs.subTitle;
  document.getElementById("game-instructions").style.display =
    configs.gameInstructionsOn;
  document.getElementById("game-over-message-container").style.display =
    configs.GameOverMessageContainerOn;
  document.getElementById("start-game-btn").style.display = configs.startGameButtonOn;
}

// Function to initialize the game board
function init() {
  console.log("Entrou na função init");
  gameActive = true;
  scoreDisplay.innerHTML = "Score: " + playerScore;
  gameOverDisplay.style.display = "none";
  gameInstructions.style.display = "none";

  // Create the initial player and food elements
  for (let i = 0; i < gameState.players.length; i++) {
    createPlayer(gameState.players[i]);
  }
  for (let i = 0; i < gameState.foods.length; i++) {
    createFood(gameState.foods[i]);
  }
}

// Function to handle the init event from the server
function handleInit(msg) {
  gameState = msg;
}

// Function to handle the gameState event from the server
function handleGameState(gameStateMsg) {
  gameState = gameStateMsg;
  // Update the player and food elements on the board
  for (let i = 0; i < gameState.players.length; i++) {
    updatePlayer(gameState.players[i]);
  }
  for (let i = 0; i < gameState.foods.length; i++) {
    updateFood(gameState.foods[i]);
  }
}

// Function to handle the gameOver event from the server
function handleGameOver() {
  gameActive = false;
  gameOverDisplay.style.display = "block";
}

// Function to handle the playerNumber event from the server
function handlePlayerNumber(number) {
  playerNumber = number;
  document.getElementById("player-number").innerHTML =
    "You are player " + playerNumber;
}

// Function to handle the playerScore event from the server
function handlePlayerScore(score) {
  playerScore = score;
  scoreDisplay.innerHTML = "Score: " + playerScore;
}

// Function to handle the gameStart event from the server
function handleGameStart() {
  startGameBtn.style.display = "none";
  gameInstructions.style.display = "none";
  init();
}

// Function to handle the gameAborted event from the server
function handleGameAborted() {
  gameActive = false;
  gameInstructions.style.display = "block";
  gameOverDisplay.style.display = "none";
}

// Function to create a player element
function createPlayer(player) {
  const newPlayer = document.createElement("div");
  newPlayer.className = "player player-" + player.id;
  newPlayer.style.gridRowStart = player.y;
  newPlayer.style.gridColumnStart = player.x;
  gameBoard.appendChild(newPlayer);
}

// Function to update a player element
function updatePlayer(player) {
  const playerElement = document.querySelector(
    ".player-" + player.playerNumber
  );
  if (playerElement) {
    playerElement.style.gridRowStart = player.y;
    playerElement.style.gridColumnStart = player.x;
  }
}

// Function to create a food element
function createFood(foods) {
  const newFood = document.createElement("div");
  newFood.className = "food";
  newFood.style.gridRowStart = foods.pos.y;
  newFood.style.gridColumnStart = foods.pos.x;
  gameBoard.appendChild(newFood);
}

// Function to update a food element
function updateFood(foods) {
  const foodElement = document.querySelector(".food");
  if (foodElement) {
    foodElement.style.gridRowStart = foods.pos.y;
    foodElement.style.gridColumnStart = foods.pos.x;
  }
}
