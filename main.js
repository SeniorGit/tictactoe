let playerX = 0;
let playerO = 0;
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";

const cells = document.querySelectorAll('.cell')
const currentPlayerDisplay = document.getElementById('currentPlayerDisplay');
document.querySelector('.scoreX').textContent = playerX;
document.querySelector('.scoreO').textContent = playerO;

document.querySelector(".playerX").addEventListener("click", ()=>{handlePlayerSwitch("X")});
document.querySelector(".playerO").addEventListener("click", ()=>{handlePlayerSwitch("O")})
document.querySelector('.resetGame').addEventListener('click', resetGame);
// Generate the game click on the board
cells.forEach((cells, index) =>{
    cells.addEventListener("click", () => handleClick(index))
})

//currect player
function updateCurrentplayer(){
    currentPlayerDisplay.textContent = currentPlayer;
}

// Swich player
function handlePlayerSwitch(newPlayer){
    if(!board.includes("X") && !board.includes("O")){
        currentPlayer = newPlayer;
    }
    currentPlayerDisplay.textContent = currentPlayer;
}

// Game win or draw checking
function handleClick(i){
    if(board[i] !== "")return;
    board[i] = currentPlayer;
    cells[i].textContent = currentPlayer;

    if(checkWinner()){
        alert(`${currentPlayer} Wins!`);
        updateScore();
        resetGame();
        return;
    }

    if(!board.includes("")){
        alert("It's a Draw!");
        resetGame();
        return;
    }
    currentPlayer = currentPlayer === "X"?"O":"X";
    currentPlayerDisplay.textContent = currentPlayer;
}

// Game scoring 
function updateScore(){
    if(currentPlayer === "X"){
        playerX++;
        document.querySelector('.scoreX').textContent = playerX;
    }else{
        playerO++;
        document.querySelector('.scoreO').textContent = playerO;
    }
}

// Reseting Game Board
function resetGame(){
    board = ["", "","", "","", "","", "",""]
    cells.forEach(cell=>{
        cell.textContent = ""
    })
}

// Check if there are any player win 
function checkWinner(){
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8], 
        [0,3,6],[1,4,7],[2,5,8], 
        [0,4,8],[2,4,6]
    ];

    return winPatterns.some(pattern =>{
        const [a,b,c] = pattern;
        return board[a] !== "" && board[a] === board[b] && board[b] === board[c];
    })

}

updateCurrentplayer()