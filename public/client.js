const socket = io();
let board = null;
let game = new Chess();
let playerColor = null;

const statusEl = document.getElementById('status');

function onDragStart(source, piece) {
  if (!game || game.game_over() || piece[0] !== playerColor[0]) return false;
}

function onDrop(source, target) {
  const move = game.move({ from: source, to: target, promotion: 'q' });

  if (move === null) return 'snapback';

  socket.emit('move', move);
  updateStatus();
}

function updateStatus() {
  statusEl.textContent = game.game_over() ? 'Game Over' : \`\${playerColor === game.turn() ? 'Your' : 'Opponent\'s'} Turn (\${game.turn().toUpperCase()})\`;
}

socket.on('playerColor', (color) => {
  playerColor = color;
  board = Chessboard('board', {
    draggable: true,
    position: 'start',
    orientation: color,
    onDragStart,
    onDrop
  });
  updateStatus();
});

socket.on('startGame', () => {
  statusEl.textContent = 'Game Started!';
});

socket.on('move', (move) => {
  game.move(move);
  board.position(game.fen());
  updateStatus();
});

socket.on('playerLeft', () => {
  alert('Your opponent has left the game.');
  window.location.reload();
});