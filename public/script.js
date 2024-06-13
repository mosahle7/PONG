// Canvas
const { body } = document;
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

const socket = io('/pong');

let isReferee = false;

const width = 500;
const height = 700;
// const screenWidth = window.screen.width;
// const canvasPosition = screenWidth / 2 - width / 2;
// const isMobile = window.matchMedia('(max-width: 600px)');
// const gameOverEl = document.createElement('div');

// Paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleX = [ 225, 225 ];
let trajectoryX = [ 0, 0 ];
let playerMoved = false;
let paddleContact = false;

// Ball
let ballX = 250;
let ballY = 350;
const ballRadius = 5;
let ballDirection = 1;

// Speed
// let speedY;
// let speedX;
// let trajectoryX;
// let computerSpeed;
let speedY = 2;
let speedX = 0;

// Change Mobile Settings
// if (isMobile.matches) {
//   speedY = -2;
//   speedX = speedY;
//   // computerSpeed = 4;
// } else {
//   speedY = -1;
//   speedX = speedY;
//   // computerSpeed = 3;
// }

// Score
// let playerScore = 0;
// let computerScore = 0;
// const winningScore = 7;
// let isGameOver = true;
// let isNewGame = true;
let score = [ 0, 0 ];

function requestFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) { // Firefox
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) { // IE/Edge
    element.msRequestFullscreen();
  }
}

// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Paddle Color
  context.fillStyle = 'white';

  // Player Paddle (Bottom)
  context.fillRect(paddleX[0], height - 20, paddleWidth, paddleHeight);

  // Computer Paddle (Top)
  context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);

  // Dashed Center Line
  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = 'grey';
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();

  // Score
  context.font = '32px Courier New';
  context.fillText(score[0], 20, canvas.height / 2 + 50);
  context.fillText(score[1], 20, canvas.height / 2 - 30);
}

// Create Canvas Element
function createCanvas() {
  canvas.id = 'canvas';
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  renderCanvas();
}

//wait for Opponents
function renderIntro() {
  //Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0,0,width,height);

  //Intro Text
  context.fillStyle = 'white';
  context.font = "32px Courier New";
  context.fillText("Waiting for opponent...", 20, (canvas.height / 2) - 30);
}

// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  // speedY = -3;
  // paddleContact = false;
  speedY = 3;
  socket.emit('ballMove', {
    ballX,
    ballY,
    score,
  });

}

// Adjust Ball Movement
// function ballMove() {
//   // Vertical Speed
//   ballY += -speedY;
//   // Horizontal Speed
//   if (playerMoved && paddleContact) {
//     ballX += speedX;
//   }
// }
function ballMove() {
  // Vertical Speed
  ballY += speedY * ballDirection;
  // Horizontal Speed
  if (playerMoved) {
    ballX += speedX;
  }
  socket.emit('ballMove', {
    ballX,
    ballY,
    score
  });
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[0] = ballX - (paddleX[0] + paddleDiff);
      speedX = trajectoryX[0] * 0.3;
    } else {
      // Reset Ball, add to Computer Score
      ballReset();
      score[1]++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX >= paddleX[1] && ballX <= paddleX[1] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
      speedX = trajectoryX[1] * 0.3;
    } else {
      ballReset();
      score[0]++;
    }
  }
}

// Computer Movement
// function computerAI() {
//   if (playerMoved) {
//     if (paddleTopX + paddleDiff < ballX) {
//       paddleTopX += computerSpeed;
//     } else {
//       paddleTopX -= computerSpeed;
//     }
//   }
// }

// function showGameOverEl(winner) {
//   // Hide Canvas
//   canvas.hidden = true;
//   // Container
//   gameOverEl.textContent = '';
//   gameOverEl.classList.add('game-over-container');
//   // Title
//   const title = document.createElement('h1');
//   title.textContent = `${winner} Wins!`;
//   // Button
//   const playAgainBtn = document.createElement('button');
//   playAgainBtn.setAttribute('onclick', 'startGame()');
//   playAgainBtn.textContent = 'Play Again';
//   // Append
//   gameOverEl.append(title, playAgainBtn);
//   body.appendChild(gameOverEl);
// }

// Check If One Player Has Winning Score, If They Do, End Game
// function gameOver() {
//   if (playerScore === winningScore || computerScore === winningScore) {
//     isGameOver = true;
//     // Set Winner
//     const winner = playerScore === winningScore ? 'Player 1' : 'Computer';
//     showGameOverEl(winner);
//   }
// }

// Called Every Frame
function animate() {
  if(isReferee){
    ballMove();
    ballBoundaries();
  }
  renderCanvas();
  window.requestAnimationFrame(animate);
  // computerAI();
  // gameOver();
  // if (!isGameOver) {
  //   window.requestAnimationFrame(animate);
  // }
}

// Start Game, Reset Everything
function startGame() {
  // if (isGameOver && !isNewGame) {
  //   body.removeChild(gameOverEl);
  //   canvas.hidden = false;
  // }
  // isGameOver = false;
  isNewGame = false;
  // playerScore = 0;
  // computerScore = 0;
  ballReset();
  // createCanvas();
  // renderIntro();
  // socket.emit('ready');
  paddleIndex = isReferee? 0:1;
  animate();
  canvas.addEventListener('mousemove', (e) => {
    playerMoved = true;
    // Compensate for canvas being centered
    // paddleBottomX = e.clientX - canvasPosition - paddleDiff;
    // if (paddleBottomX < paddleDiff) {
    //   paddleBottomX = 0;
    // }
    // if (paddleBottomX > width - paddleWidth) {
    //   paddleBottomX = width - paddleWidth;
    // }
    paddleX[paddleIndex] = e.offsetX;
    if (paddleX[paddleIndex] < 0) {
      paddleX[paddleIndex] = 0;
    }
    if (paddleX[paddleIndex] > (width - paddleWidth)) {
      paddleX[paddleIndex] = width - paddleWidth;
    }
    socket.emit('paddleMove', {
      xPosition: paddleX[paddleIndex],
    });
    // Hide Cursor
    canvas.style.cursor = 'none';
  });
}
function loadGame() {
  createCanvas();
  renderIntro();
  document.addEventListener('click', () => {
    requestFullscreen(document.documentElement); // Request fullscreen on the canvas element
  }, { once: true }); 
  socket.emit('ready');
}
// On Load
loadGame();

socket.on('connect', () => {
  console.log('Connected as...', socket.id);
})

socket.on('startGame', (refereeId) => {
  console.log('Referee is ', refereeId);

  isReferee=socket.id === refereeId; 
  startGame()
})

socket.on('paddleMove', (paddleData) => {
  const opponentPaddleIndex =  1-paddleIndex
  paddleX[opponentPaddleIndex] = paddleData.xPosition
})

socket.on('ballMove', (ballData) => {
  ({ballX,ballY,score} = ballData);
})

