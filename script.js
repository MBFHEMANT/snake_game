const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const restartBtn = document.getElementById('restart-btn');

// Load custom image asset for the Snake's head
const headImage = new Image();
headImage.src = 'personA.png';
const eatSound = new Audio('Audio Person A.ogg');
eatSound.preload = 'auto';

// Configured values based on your custom requirements
const GRID_SIZE = 10;   // Set to 10 as specified for high block visibility
const GAME_SPEED = 220; // Increased window (ms) = Decreased physical speed!

let cellSize;
let snake = [];
let food = {};
let dx = 0;             // Game starts idle until you press a directional arrow
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0; // Persistent highscore load
let gameInterval;

// Displays the initial highscore retrieved from memory
highScoreElement.textContent = highScore;

function resizeCanvas() {
    const wrapper = document.getElementById('canvas-wrapper');
    const size = Math.min(wrapper.clientWidth, wrapper.clientHeight) - 8;
    canvas.width = size;
    canvas.height = size;
    cellSize = size / GRID_SIZE;
    draw();
}

window.addEventListener('resize', resizeCanvas);

function initGame() {
    // Reset Snake sequence back to horizontal orientation center
    snake = [
        { x: 4, y: 5 },
        { x: 3, y: 5 },
        { x: 2, y: 5 }
    ];
    
    // Reset structural dynamics to resting state
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    
    generateFood();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameStep, GAME_SPEED);
    resizeCanvas();
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
    };
    // Re-roll positioning if food drops on the active body path
    for (let cell of snake) {
        if (cell.x === food.x && cell.y === food.y) {
            generateFood();
            break;
        }
    }
}

function gameStep() {
    // Skip logical translation processing if player has not picked a direction yet
    if (dx === 0 && dy === 0) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check hit boundaries or structural intersections
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || checkSelfCollision(head)) {
        clearInterval(gameInterval);
        alert(`Game Over! Total Points: ${score}`);
        initGame();
        return;
    }

    snake.unshift(head);

   // Score point check 
if (head.x === food.x && head.y === food.y) { 

    // Play Person A sound
    eatSound.currentTime = 0;
    eatSound.play().catch(() => {});

    score += 10; 
    scoreElement.textContent = score;
        // Track highscore record breaking
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore); // Saves to user profile database
        }
        generateFood();
    } else {
        snake.pop();
    }

    draw();
}

function checkSelfCollision(head) {
    return snake.some((cell, index) => index !== 0 && cell.x === head.x && cell.y === head.y);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Target Apple Block
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    const radius = cellSize / 2;
    ctx.arc(food.x * cellSize + radius, food.y * cellSize + radius, radius - 2, 0, Math.PI * 2);
    ctx.fill();

    // Iterate structural blocks configuration
    snake.forEach((cell, index) => {
        if (index === 0) {
            // Draw personA.png face as the head segment
            if (headImage.complete && headImage.naturalWidth !== 0) {
                ctx.drawImage(headImage, cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
            } else {
                // Bright cyan backup block if picture data fails processing
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize - 1, cellSize - 1);
            }
        } else {
            // Body Tail render properties
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(cell.x * cellSize + 1, cell.y * cellSize + 1, cellSize - 2, cellSize - 2);
        }
    });
}

function changeDirection(newDx, newDy) {
    // Prevent backward snapping inputs directly into yourself
    if ((newDx === -dx && newDx !== 0) || (newDy === -dy && newDy !== 0)) return;
    dx = newDx;
    dy = newDy;
}

// Global Keyboard Tracking 
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': changeDirection(0, -1); break;
        case 'ArrowDown': case 's': case 'S': changeDirection(0, 1); break;
        case 'ArrowLeft': case 'a': case 'A': changeDirection(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': changeDirection(1, 0); break;
    }
});

// Permanent On-Screen D-Pad Click Events (Supports desktop clicks & mobile finger tabs)
document.getElementById('ctrl-up').addEventListener('click', () => changeDirection(0, -1));
document.getElementById('ctrl-down').addEventListener('click', () => changeDirection(0, 1));
document.getElementById('ctrl-left').addEventListener('click', () => changeDirection(-1, 0));
document.getElementById('ctrl-right').addEventListener('click', () => changeDirection(1, 0));

restartBtn.addEventListener('click', initGame);

// Load image parameters to initiate game system loop
headImage.onload = () => draw();
initGame();
