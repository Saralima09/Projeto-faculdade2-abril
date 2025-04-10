const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");

const audio = new Audio("../assets/audio.mp3");

const size = 30;  // Tamanho dos quadrados da cobra e da comida

const initialPosition = { x: 150, y: 150 };  // Posição inicial da cobra

let snake = [initialPosition];
let direction;
let loopId;

const incrementScore = () => {
    score.innerText = +score.innerText + 10;
}

const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
}

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size);
    return Math.round(number / 30) * 30;
}

const randomColor = () => {
    const red = randomNumber(0, 255);
    const green = randomNumber(0, 255);
    const blue = randomNumber(0, 255);
    return `rgb(${red}, ${green}, ${blue})`;
}

const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
}

const drawFood = () => {
    const { x, y, color } = food;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    ctx.shadowBlur = 0;
}

const drawSnake = () => {
    ctx.fillStyle = "#ddd";

    snake.forEach((position, index) => {
        if (index === snake.length - 1) {
            ctx.fillStyle = "red";  // A cabeça da cobra
        }

        ctx.fillRect(position.x, position.y, size, size);
    });
}

const moveSnake = () => {
    if (!direction) return;

    const head = snake[snake.length - 1];

    if (direction === "right") {
        snake.push({ x: head.x + size, y: head.y });
    }

    if (direction === "left") {
        snake.push({ x: head.x - size, y: head.y });
    }

    if (direction === "down") {
        snake.push({ x: head.x, y: head.y + size });
    }

    if (direction === "up") {
        snake.push({ x: head.x, y: head.y - size });
    }

    snake.shift();  // Remove a cauda da cobra
}

const drawGrid = () => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#191919";

    // Desenha linhas de grid
    for (let i = 0; i < canvas.width; i += size) {
        ctx.beginPath();
        ctx.lineTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

const checkEat = () => {
    const head = snake[snake.length - 1];

    if (head.x === food.x && head.y === food.y) {
        incrementScore();
        snake.push(head);
        audio.play();

        let x = randomPosition();
        let y = randomPosition();

        // a nova comida não aparece onde a cobra já está
        while (snake.find((position) => position.x === x && position.y === y)) {
            x = randomPosition();
            y = randomPosition();
        }

        food.x = x;
        food.y = y;
        food.color = randomColor();
    }
}

const checkCollision = () => {
    const head = snake[snake.length - 1];

    const canvasLimit = canvas.width - size;
    const neckIndex = snake.length - 2;

    // Verifica se a cobra bateu nas paredes ou em si mesma
    const wallCollision =
        head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit;

    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x === head.x && position.y === head.y;
    });

    if (wallCollision || selfCollision) {
        gameOver();  // Chama gameOver quando ocorre uma colisão
    }
}

const gameOver = () => {
    direction = undefined;  // Para a cobra
    menu.style.display = "flex";  // Mostrar o menu de Game Over
    finalScore.innerText = score.innerText;  // pontuação final
    canvas.style.filter = "blur(2px)";  // filtro de desfoque ao canvas
}

const gameLoop = () => {
    clearInterval(loopId);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawFood();
    moveSnake();
    drawSnake();
    checkEat();
    checkCollision();

    loopId = setTimeout(() => {
        gameLoop();
    }, 100);  // Aumentei a velocidade do loop
}

gameLoop();

document.addEventListener("keydown", ({ key }) => {
    if (key === "ArrowRight" && direction !== "left") {
        direction = "right";
    }

    if (key === "ArrowLeft" && direction !== "right") {
        direction = "left";
    }

    if (key === "ArrowDown" && direction !== "up") {
        direction = "down";
    }

    if (key === "ArrowUp" && direction !== "down") {
        direction = "up";
    }
});

buttonPlay.addEventListener("click", () => {
    score.innerText = "00";  // Reseta o score
    menu.style.display = "none";  // Esconde o menu de game over
    canvas.style.filter = "none";  // Remove o filtro de desfoque do canvas

    snake = [initialPosition];  // Reinicia a cobra na posição inicial
    direction = undefined;  // Reseta a direção
    gameLoop();  // Reinicia o jogo
});
