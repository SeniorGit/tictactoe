'use strict';

const SIZE = 3;

const LINES = [
    { cells: [0, 1, 2], name: 'Top row' },
    { cells: [3, 4, 5], name: 'Middle row' },
    { cells: [6, 7, 8], name: 'Bottom row' },
    { cells: [0, 3, 6], name: 'Left column' },
    { cells: [1, 4, 7], name: 'Middle column' },
    { cells: [2, 5, 8], name: 'Right column' },
    { cells: [0, 4, 8], name: 'Diagonal, top left to bottom right' },
    { cells: [2, 4, 6], name: 'Diagonal, top right to bottom left' },
];

const game = {
    board: emptyBoard(),
    starter: 'X',
    turn: 'X',
    round: 1,
    scores: { X: 0, O: 0 },
    draws: 0,
    result: null,
};

function emptyBoard() {
    return Array(SIZE * SIZE).fill(null);
}

function otherPlayer(player) {
    return player === 'X' ? 'O' : 'X';
}

function findWinningLine(board) {
    return LINES.find(({ cells: [a, b, c] }) => board[a] && board[a] === board[b] && board[a] === board[c]) ?? null;
}

function hasStarted() {
    return game.board.some(Boolean);
}

function playMove(index) {
    if (game.result || game.board[index]) return false;

    game.board[index] = game.turn;
    const line = findWinningLine(game.board);

    if (line) {
        game.result = { type: 'win', player: game.turn, line };
        game.scores[game.turn] += 1;
    } else if (game.board.every(Boolean)) {
        game.result = { type: 'draw' };
        game.draws += 1;
    } else {
        game.turn = otherPlayer(game.turn);
    }
    return true;
}

function setStarter(player) {
    if (hasStarted()) return;
    game.starter = player;
    game.turn = player;
}

function startNewRound() {
    if (game.result) {
        game.round += 1;
        game.starter = otherPlayer(game.starter);
    }
    game.board = emptyBoard();
    game.result = null;
    game.turn = game.starter;
}

function resetScore() {
    game.scores = { X: 0, O: 0 };
    game.draws = 0;
    game.round = 1;
    game.starter = 'X';
    game.board = emptyBoard();
    game.result = null;
    game.turn = 'X';
}

const els = {
    board: document.getElementById('board'),
    cells: [...document.querySelectorAll('.cell')],
    statusKicker: document.getElementById('status-kicker'),
    statusLine: document.getElementById('status-line'),
    statusDetail: document.getElementById('status-detail'),
    scoreX: document.getElementById('score-x'),
    scoreO: document.getElementById('score-o'),
    round: document.getElementById('round'),
    draws: document.getElementById('draws'),
    starter: document.querySelector('.starter'),
    starterInputs: [...document.querySelectorAll('.starter__input')],
    newRound: document.getElementById('new-round'),
    resetScore: document.getElementById('reset-score'),
};

function setData(el, name, value) {
    if (value === null) {
        delete el.dataset[name];
    } else {
        el.dataset[name] = value;
    }
}

function cellLabel(index, mark, isWinning) {
    const row = Math.floor(index / SIZE) + 1;
    const column = (index % SIZE) + 1;
    const state = mark ? `${mark}${isWinning ? ', part of the winning line' : ''}` : 'empty';
    return `Row ${row}, column ${column}, ${state}`;
}

function stampMarkup(player) {
    return `<span class="stamp" data-shape="${player}"><span class="visually-hidden">${player}</span></span>`;
}

function renderBoard() {
    const { board, result, turn } = game;
    const winningCells = result?.type === 'win' ? result.line.cells : [];

    setData(els.board, 'over', result ? result.type : null);
    setData(els.board, 'winner', result?.type === 'win' ? result.player : null);

    els.cells.forEach((cell, index) => {
        const mark = board[index];
        const order = winningCells.indexOf(index) + 1;

        setData(cell, 'shape', mark ?? (result ? null : turn));
        setData(cell, 'placed', mark ? '' : null);
        setData(cell, 'win', order || null);
        cell.setAttribute('aria-disabled', String(Boolean(mark || result)));
        cell.setAttribute('aria-label', cellLabel(index, mark, order > 0));
    });
}

function renderStatus() {
    const { result, turn, board } = game;

    if (!result) {
        const moveNumber = board.filter(Boolean).length + 1;
        els.statusKicker.textContent = 'Turn';
        els.statusLine.innerHTML = `${stampMarkup(turn)} to move.`;
        els.statusDetail.textContent = `Move ${moveNumber} of ${board.length}`;
    } else if (result.type === 'win') {
        els.statusKicker.textContent = 'Result';
        els.statusLine.innerHTML = `${stampMarkup(result.player)} wins.`;
        els.statusDetail.textContent = `${result.line.name}. Three in a line.`;
    } else {
        els.statusKicker.textContent = 'Result';
        els.statusLine.textContent = 'Draw.';
        els.statusDetail.textContent = 'Nine marks, no line.';
    }
}

function renderNumber(el, value) {
    if (el.dataset.value === String(value)) return;
    el.dataset.value = value;
    const pad = value < 10 ? '<span class="ledger__pad" aria-hidden="true">0</span>' : '';
    el.innerHTML = `<span class="ledger__tick">${pad}${value}</span>`;
}

function renderLedger() {
    renderNumber(els.scoreX, game.scores.X);
    renderNumber(els.scoreO, game.scores.O);
    renderNumber(els.round, game.round);
    renderNumber(els.draws, game.draws);
}

function renderControls() {
    const locked = hasStarted();
    els.starterInputs.forEach((input) => {
        input.checked = input.value === game.starter;
        input.disabled = locked;
    });
    els.newRound.classList.toggle('btn--primary', Boolean(game.result));
}

function render() {
    renderBoard();
    renderStatus();
    renderLedger();
    renderControls();
}

let tabStop = els.cells[0];

function setTabStop(cell) {
    if (cell === tabStop) return;
    tabStop.tabIndex = -1;
    cell.tabIndex = 0;
    tabStop = cell;
}

const ARROW_STEPS = {
    ArrowLeft: { column: -1, row: 0 },
    ArrowRight: { column: 1, row: 0 },
    ArrowUp: { column: 0, row: -1 },
    ArrowDown: { column: 0, row: 1 },
};

els.board.addEventListener('click', (event) => {
    const cell = event.target.closest('.cell');
    if (!cell) return;

    setTabStop(cell);
    if (playMove(els.cells.indexOf(cell))) render();
});

els.board.addEventListener('focusin', (event) => {
    const cell = event.target.closest('.cell');
    if (cell) setTabStop(cell);
});

els.board.addEventListener('keydown', (event) => {
    const step = ARROW_STEPS[event.key];
    const from = els.cells.indexOf(event.target.closest('.cell'));
    if (!step || from < 0) return;

    event.preventDefault();
    const column = (from % SIZE) + step.column;
    const row = Math.floor(from / SIZE) + step.row;
    if (column < 0 || column >= SIZE || row < 0 || row >= SIZE) return;

    els.cells[row * SIZE + column].focus();
});

els.starter.addEventListener('change', (event) => {
    setStarter(event.target.value);
    render();
});

els.newRound.addEventListener('click', () => {
    startNewRound();
    render();
});

els.resetScore.addEventListener('click', () => {
    resetScore();
    render();
});

render();
