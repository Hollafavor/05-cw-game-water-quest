// Game configuration and state variables
const GOAL_CANS = 20;        // Total items needed to win
const GAME_DURATION = 30;
const winningMessages = [
  'Amazing work! You won!',
  'Well done! You collected enough cans!',
  'You did it! Water Quest complete!'
];
const losingMessages = [
  'Time is up. Try again!',
  'Not quite this time. Try again!',
  'Keep going! You can collect 20 next time.'
];
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let timerInterval;
let confettiTimeout;
const scoreDisplay = document.getElementById('current-cans');
const timerDisplay = document.getElementById('timer');
const achievementDisplay = document.getElementById('achievements');
const confettiContainer = document.getElementById('confetti');

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear all cells before spawning a new water can
  cells.forEach(cell => (cell.innerHTML = ''));

  // Select a random cell from the grid to place the water can
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  if (Math.random() < 0.25) {
    randomCell.innerHTML = '<button type="button" class="water-obstacle" aria-label="Obstacle: lose 1 point">!</button>';
  } else {
    randomCell.innerHTML = `
      <div class="water-can-wrapper">
        <div class="water-can"></div>
      </div>
    `;
  }
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  gameActive = true;
  currentCans = 0;
  scoreDisplay.textContent = currentCans;
  scoreDisplay.classList.remove('score-hit', 'score-pop');
  timerDisplay.textContent = GAME_DURATION;
  achievementDisplay.textContent = '';
  achievementDisplay.classList.remove('win', 'loss');
  createGrid(); // Set up the game grid
  spawnInterval = setInterval(spawnWaterCan, 1000); // Spawn water cans every second
  let timeLeft = GAME_DURATION;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft === 0) endGame();
  }, 1000);
}

function endGame() {
  if (!gameActive) return;
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(timerInterval);

  const hasWon = currentCans >= GOAL_CANS;
  const messages = hasWon ? winningMessages : losingMessages;
  achievementDisplay.textContent = messages[Math.floor(Math.random() * messages.length)];
  achievementDisplay.classList.add(hasWon ? 'win' : 'loss');
  if (hasWon) showConfetti();
}

function resetGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  clearTimeout(confettiTimeout);
  confettiContainer.innerHTML = '';
  currentCans = 0;
  scoreDisplay.textContent = currentCans;
  scoreDisplay.classList.remove('score-hit', 'score-pop');
  timerDisplay.textContent = GAME_DURATION;
  achievementDisplay.textContent = '';
  achievementDisplay.classList.remove('win', 'loss');
  createGrid();
}

function showConfetti() {
  const colors = ['#FFC907', '#2E9DF7', '#8BD1CB', '#4FCB53'];
  confettiContainer.innerHTML = '';

  for (let index = 0; index < 48; index++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.setProperty('--fall-delay', `${Math.random() * 0.6}s`);
    piece.style.setProperty('--fall-duration', `${2 + Math.random() * 1.2}s`);
    confettiContainer.appendChild(piece);
  }

  clearTimeout(confettiTimeout);
  confettiTimeout = setTimeout(() => {
    confettiContainer.innerHTML = '';
  }, 3500);
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('reset-game').addEventListener('click', resetGame);

// Handle clicks on spawned cans and obstacles.
document.querySelector('.game-grid').addEventListener('click', event => {
  const waterCan = event.target.closest('.water-can');
  const obstacle = event.target.closest('.water-obstacle');
  if (!gameActive || (!waterCan && !obstacle)) return;

  currentCans = Math.max(0, currentCans + (waterCan ? 1 : -1));
  scoreDisplay.textContent = currentCans;
  scoreDisplay.classList.remove('score-pop');
  scoreDisplay.classList.toggle('score-hit', Boolean(obstacle));
  void scoreDisplay.offsetWidth;
  scoreDisplay.classList.add('score-pop');
  (waterCan || obstacle).closest('.grid-cell').innerHTML = '';
});
