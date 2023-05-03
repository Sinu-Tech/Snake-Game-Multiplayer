const socket = io();

const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const gameOverDisplay = document.getElementById("game-over-message-container");
const gameInstructions = document.getElementById("game-instructions");
const startGameBtn = document.getElementById("start-game-btn");

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
    console.log(event.key);
    if (event.key === "a" || event.key === "A" || event.key === "ArrowLeft") {
      socket.emit("playerMove", "left");
    } else if (event.key === "w" || event.key === "W" || event.key === "ArrowUp") {
      socket.emit("playerMove", "up");
    } else if (event.key === "d" || event.key === "D" || event.key === "ArrowRight") {
      socket.emit("playerMove", "right");
    } else if (event.key === "s" || event.key === "S"|| event.key === "ArrowDown") {
      socket.emit("playerMove", "down");
    }
  }
});

// Listen for updates from the server
socket.on("init", handleInit);
socket.on("gameState", handleGameState);
// socket.on("gameOver", handleGameOver);
// socket.on("playerNumber", handlePlayerNumber);
// socket.on("playerScore", handlePlayerScore);
socket.on("gameStart", handleGameStart);
// socket.on("gameAborted", handleGameAborted);
socket.on("visualConfigs", handleVisualConfigs);
socket.on("updateFood", handleUpdateFood);

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

// Function to initialize the game board
function handleGameStart(gameStateMsg) {
  console.log("Entrou na função gameStart cliente");
  gameActive = true;
  scoreDisplay.innerHTML = "Score: " + playerScore;
  gameState = gameStateMsg;

  // Create the initial player and food element
  for (let i = 0; i < gameState.players.length; i++) {
    createPlayer(gameState.players[i]);
  }
  console.log(gameState.food);
  createFood(gameState.food);
}

// Function to handle the init event from the server
function handleInit(msg) {
  console.log("Entrou na função handleInit");
  gameState = msg;
}

function handleUpdateFood(food) {
  updateFood(food);
}


// Function to handle the gameState event from the server
function handleGameState(gameStateMsg) {
  console.log("Entrou na função handleGameState")
  // console.log(gameStateMsg.players[0].id + " -  x: " + gameStateMsg.players[0].x + " y: " + gameStateMsg.players[0].y);
  // console.log(gameStateMsg.players[1].id + " -  x: " + gameStateMsg.players[1].x + " y: " + gameStateMsg.players[1].y);
  gameState = gameStateMsg;
  console.log(gameState.players);
  // Update the player and food elements on the board
  for (let i = 0; i < gameState.players.length; i++) {
    updatePlayer(gameState.players[i]);
  }
}

// Function to handle the gameOver event from the server
// function handleGameOver() {
//   console.log("Entrou na função handleGameOver");
//   gameActive = false;
//   gameOverDisplay.style.display = "block";
// }

// Function to handle the playerNumber event from the server
// function handlePlayerNumber(number) {
//   console.log("Entrou na função handlePlayerNumber");
//   playerNumber = number;
//   document.getElementById("player-number").innerHTML =
//     "You are player a number:  " + playerNumber;
// }

// Function to handle the playerScore event from the server
// function handlePlayerScore(score) {
//   console.log("Entrou na função handlePlayerScore");
//   playerScore = score;
//   scoreDisplay.innerHTML = "Score: " + playerScore;
// }

// Function to handle the gameAborted event from the server
// function handleGameAborted() {
//   console.log("Entrou na função handleGameAborted");
//   gameActive = false;
//   gameInstructions.style.display = "block";
//   gameOverDisplay.style.display = "none";
// }

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

// Function to update a player element
function updatePlayer(player) {
  console.log("Entrou na função updatePlayer");
  console.log(player.id);
  const playerElement = document.querySelector(
    ".player-" + player.id
  );
  console.log(playerElement)
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
  console.log(food)
  const foodElement = document.querySelector(".food");
  console.log(foodElement)
  if (foodElement) {
    foodElement.style.top = food.y * 20 + "px";
    foodElement.style.left = food.x * 20 + "px";
  }

}


