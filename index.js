const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 620;
canvas.height = 417;

let counter = 0;
/* Variables de la pelota*/
const ballRadius = 10;
//posicion de la pelota
let x = canvas.width / 2;
let y = canvas.height - 65;
//velocidad de la pelota
let dx = 6;
let dy = -6;

/*Variables de la paleta*/
const paddleHeight = 20;
const paddleWidth = 70;

let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = canvas.height - paddleHeight - 50;

let rightPressed = false;
let leftPressed = false;

/* Variables de los ladrillos*/
const brickRowCount = 6;
const brickColumnCount = 9;
const brickWidth = 50;
const brickHeight = 15;
const brickPadding = 3;
const brickOffsetTop = 80;
const brickOffsetLeft = 82;
const bricks = [];

const BRICK_STATUS = {
  ACTIVE: 1,
  DESTROYED: 0,
};

for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    //calculamos la posición del ladrillo en la pantalla
    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
    //color aleatorio a cada ladrillo
    const random = Math.floor(Math.random() * 8);
    //guardamos la info de cada ladrillo
    bricks[c][r] = {
      x: brickX,
      y: brickY,
      status: BRICK_STATUS.ACTIVE,
      color: random,
    };
  }
}

const PADDLE_SENSITIVITY = 12;

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "whitesmoke";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.fillStyle = "whitesmoke";
  ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;

      ctx.fillStyle = "whitesmoke";
      ctx.rect(currentBrick.x, currentBrick.y, brickWidth, brickHeight);

      ctx.fill();
    }
  }
}

let score = 0;

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Score: " + score, 8, 20);
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;

      const isBallSameXAsBrick =
        x > currentBrick.x && x < currentBrick.x + brickWidth;

      const isBallSameYAsBrick =
        y > currentBrick.y && y < currentBrick.y + brickHeight;

      if (isBallSameXAsBrick && isBallSameYAsBrick) {
        dy = -dy;
        currentBrick.status = BRICK_STATUS.DESTROYED;

        score += 50;

        document.getElementById("brickSound").play();
      }
    }
  }
}

function ballMovement() {
  //rebotar en los laterales
  if (
    x + dx > canvas.width - ballRadius || //pared drcha
    x + dx < ballRadius
  ) {
    //pared izqda
    dx = -dx;
  }

  //rebotar arriba
  if (y + dy < ballRadius) {
    dy = -dy;
  }

  //la pelota toca la pala
  const isBallSameXAsPaddle = x > paddleX && x < paddleX + paddleWidth;

  const isBallTouchingPaddle = y + dy > paddleY;

  if (isBallSameXAsPaddle && isBallTouchingPaddle) {
    dy = -dy; //cambiamos la dirección de la pelota
  } else if (
    //la pelota toca el suelo
    y + dy >
    canvas.height - ballRadius
  ) {
    console.log("Game Over");
    document.getElementById("gameOverSound").play();
    document.location.reload();
  }

  //mover la pelota
  x += dx;
  y += dy;
}

function paddleMovement() {
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += PADDLE_SENSITIVITY;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= PADDLE_SENSITIVITY;
  }
}

function cleanCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const vw = document.body.clientWidth;
const isMobile = vw <= 768;
const lBtn = document.getElementById("left");
const rBtn = document.getElementById("right");

if (isMobile) {
  lBtn.addEventListener("click", () => {
    rightPressed = false;
    leftPressed = true;
  });

  rBtn.addEventListener("click", () => {
    leftPressed = false;
    rightPressed = true;
  });
} else {
  lBtn.style.display = "none";
  rBtn.style.display = "none";
}

function initEvents() {
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);

  function keyDownHandler(event) {
    const { key } = event;
    if (key === "Right" || key === "ArrowRight") {
      rightPressed = true;
    } else if (key === "Left" || key === "ArrowLeft") {
      leftPressed = true;
    }
  }
  function keyUpHandler(event) {
    const { key } = event;
    if (key === "Right" || key === "ArrowRight") {
      rightPressed = false;
    } else if (key === "Left" || key === "ArrowLeft") {
      leftPressed = false;
    }
  }
}
document.getElementById("startButton").addEventListener("click", startGame);

function startGame() {
  document.getElementById("startSound").play();
  initEvents();

  function draw() {
    cleanCanvas();
    drawBall();
    drawPaddle();
    drawBricks();
    drawScore();

    //colisiones y movimientos
    collisionDetection();
    ballMovement();
    paddleMovement();

    // Revisa si la pelota ha tocado el suelo
    if (y + dy > canvas.height - ballRadius) {
      // mensaje de "Game Over"
      ctx.font = "30px Arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

      // sonido de game over
      document.getElementById("gameOverSound").play();

      // Recargar la página después de 3 seg
      setTimeout(function () {
        document.location.reload();
      }, 3000);
    } else {
      requestAnimationFrame(draw);
    }
  }
  draw();
}
