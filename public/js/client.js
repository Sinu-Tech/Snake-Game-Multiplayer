const socket = io();

// Saving all the DOM elements in variables
const gameArea = document.getElementById("game-area");
const gameBoard = document.getElementById("game-board");
const playersScoreContainer = document.getElementById(
  "players-score-container"
);
const gameScoreContainer = document.getElementById("game-score-container");
const gameInstructions = document.getElementById("game-instructions");
const startGameBtn = document.getElementById("start-game-btn");
const playerReadyBtn = document.getElementById("player-ready-btn");
const userFormData = document.getElementById("user-form-data");

// Game variables
let gameActive = false;

// Listen for start game button click
startGameBtn.addEventListener("click", gameStartEvent);

// Listen for player ready button click
playerReadyBtn.addEventListener("click", playerReadyEvent);

// Listen for keydown events to move the player
document.addEventListener("keydown", (event) => {
  if (gameActive) {
    let pressedKey = getPressedKey(event.key);
    if (pressedKey) {
      socket.emit("playerPressedDirection", pressedKey);
    }
  }
});

// Listen for updates from the server
socket.on("gameStart", handleGameStart);
socket.on("updatePlayersPosition", handleUpdatePlayersPosition);
socket.on("createPlayersScore", handleCreatePlayersScore);
socket.on("updatePlayersScore", handleUpdatePlayersScore);
socket.on("updateFoodPosition", handleUpdateFoodPosition);

// Function to initialize the game board
function handleGameStart({ players, food }) {
  gameActive = true;

  gameScoreContainer.style.visibility = "visible";
  document.getElementById("start-game-btn").style.display = "none";

  // Create the initial player and food element
  players.forEach((player) => {
    createPlayer(player);
  });
  createFood(food);
}

// Function to handle the gameState event from the server
function handleUpdatePlayersPosition(players) {
  players.forEach((player) => {
    updatePlayerPosition(player);
  });
}

// Placar de todos os jogadores
function handleCreatePlayersScore(players) {
  players.forEach((player) => {
    createPlayerScore(player.id, player.name, player.color);
  });
}

// Function to handle update players score
function handleUpdatePlayersScore(players) {
  players.forEach((player) => {
    updatePlayerScore(player.id, player.name, player.score);
  });
}

// Function to uptade food position
function handleUpdateFoodPosition(food) {
  updateFoodPosition(food);
}

// Function to create a playerScore element
function createPlayerScore(playerId, playerName, playerColor) {
  const newScorePlayer = document.createElement("p");
  newScorePlayer.className = "score score-" + playerId;
  newScorePlayer.style.color = playerColor;
  newScorePlayer.style.textOverflow = "ellipsis";
  newScorePlayer.style.width = "260px";
  newScorePlayer.innerText = "0 - " + playerName;
  playersScoreContainer.appendChild(newScorePlayer);
}

// Function to update a player score element
function updatePlayerScore(playerId, playerName, score) {
  const scoreElement = document.querySelector(".score-" + playerId);

  if (scoreElement) {
    scoreElement.innerText = score + " - " + playerName;
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

  // EASTER EGG
  let playerName = player.name.toUpperCase();
  const playerImg = document.createElement("img");
  playerImg.style.width = "20px";
  playerImg.style.height = "20px";

  switch (playerName) {
    case "KENDY":
      playerImg.src = "../assets/imgs/kendy.jpg";
      newPlayer.appendChild(playerImg);
      break;
    case "ERICLES":
      playerImg.src = "../assets/imgs/ericles.jpg";
      newPlayer.appendChild(playerImg);
      break;
    case "MILENA":
      playerImg.src = "../assets/imgs/milena.jpg";
      newPlayer.appendChild(playerImg);
      break;
  }
  gameBoard.appendChild(newPlayer);
}

// Function to update a player position element
function updatePlayerPosition(player) {
  const playerElement = document.querySelector(".player-" + player.id);
  if (playerElement) {
    playerElement.style.top = player.y * 20 + "px";
    playerElement.style.left = player.x * 20 + "px";
  }
}

// Function to create a food element
function createFood(food) {
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
function updateFoodPosition(food) {
  const foodElement = document.querySelector(".food");
  if (foodElement) {
    foodElement.style.top = food.y * 20 + "px";
    foodElement.style.left = food.x * 20 + "px";
  }
}

// Function to handle the player ready event
function playerReadyEvent() {
  let username = document.getElementById("username").value;
  if (username === "") {
    alert("Digite um nome de usuário");
    return;
  }

  let usercolor = document.getElementById("usercolor").value;

  let userData = {
    username: username,
    usercolor: usercolor,
  };
  
  // hide userform and show game area
  document.getElementById("form-container").style.display = "none";
  gameArea.style.display = "flex";
  gameInstructions.style.display = "flex";
  
  socket.emit("userReady", userData);
}

// Function to handle the game start event
function gameStartEvent() {
  socket.emit("gameStart");
}

// Function to verify direction of pressed key
function getPressedKey(key) {
  if (key === "a" || key === "A" || key === "ArrowLeft") {
    return "left";
  } else if (key === "w" || key === "W" || key === "ArrowUp") {
    return "up";
  } else if (key === "d" || key === "D" || key === "ArrowRight") {
    return "right";
  } else if (key === "s" || key === "S" || key === "ArrowDown") {
    return "down";
  }
}
