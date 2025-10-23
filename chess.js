class ChessGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.gameOver = false;
        this.capturedPieces = {
            white: [],
            black: []
        };
        this.initBoard();
        this.renderBoard();
        this.updateGameInfo();
    }

    initBoard() {
        // Inicializar tablero vacío
        this.board = Array(8).fill().map(() => Array(8).fill(null));

        // Colocar peones
        for (let i = 0; i < 8; i++) {
            this.board[1][i] = { type: 'pawn', color: 'black' };
            this.board[6][i] = { type: 'pawn', color: 'white' };
        }

        // Colocar piezas principales
        const backRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        
        for (let i = 0; i < 8; i++) {
            this.board[0][i] = { type: backRow[i], color: 'black' };
            this.board[7][i] = { type: backRow[i], color: 'white' };
        }
    }

    getPieceSymbol(piece) {
        if (!piece) return '';
        
        const symbols = {
            white: {
                king: '♔',
                queen: '♕',
                rook: '♖',
                bishop: '♗',
                knight: '♘',
                pawn: '♙'
            },
            black: {
                king: '♚',
                queen: '♛',
                rook: '♜',
                bishop: '♝',
                knight: '♞',
                pawn: '♟'
            }
        };
        
        return symbols[piece.color][piece.type];
    }

    renderBoard() {
        const boardElement = document.getElementById('chess-board');
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'row';

            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                const piece = this.board[row][col];
                if (piece) {
                    square.textContent = this.getPieceSymbol(piece);
                }

                // Marcar si es seleccionado o movimiento posible
                if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
                    square.classList.add('selected');
                }

                if (this.possibleMoves.some(move => move.row === row && move.col === col)) {
                    square.classList.add('possible-move');
                }

                square.addEventListener('click', () => this.handleSquareClick(row, col));
                rowElement.appendChild(square);
            }

            boardElement.appendChild(rowElement);
        }
    }

    handleSquareClick(row, col) {
        if (this.gameOver) return;

        const piece = this.board[row][col];

        // Si ya hay una pieza seleccionada
        if (this.selectedPiece) {
            // Verificar si el clic es en un movimiento posible
            const isPossibleMove = this.possibleMoves.some(
                move => move.row === row && move.col === col
            );

            if (isPossibleMove) {
                this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
                this.selectedPiece = null;
                this.possibleMoves = [];
                this.switchPlayer();
            } else if (piece && piece.color === this.currentPlayer) {
                // Seleccionar una nueva pieza del mismo color
                this.selectedPiece = { row, col, piece };
                this.possibleMoves = this.getPossibleMoves(row, col);
            } else {
                // Deseleccionar
                this.selectedPiece = null;
                this.possibleMoves = [];
            }
        } else if (piece && piece.color === this.currentPlayer) {
            // Seleccionar una pieza
            this.selectedPiece = { row, col, piece };
            this.possibleMoves = this.getPossibleMoves(row, col);
        }

        this.renderBoard();
        this.updateGameInfo();
    }

    getPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];
        const directions = {
            pawn: { white: [[-1, 0]], black: [[1, 0]] },
            rook: [[-1, 0], [1, 0], [0, -1], [0, 1]],
            bishop: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
            queen: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]],
            king: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]
        };

        // Movimientos básicos para peones (simplificado)
        if (piece.type === 'pawn') {
            const direction = piece.color === 'white' ? -1 : 1;
            const newRow = row + direction;
            
            if (this.isValidPosition(newRow, col) && !this.board[newRow][col]) {
                moves.push({ row: newRow, col: col });
            }

            // Captura diagonal
            for (let dc of [-1, 1]) {
                const newCol = col + dc;
                if (this.isValidPosition(newRow, newCol) && 
                    this.board[newRow][newCol] && 
                    this.board[newRow][newCol].color !== piece.color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        } else if (piece.type === 'knight') {
            // Movimientos de caballo
            const knightMoves = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            
            for (let [dr, dc] of knightMoves) {
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (this.isValidPosition(newRow, newCol) && 
                    (!this.board[newRow][newCol] || this.board[newRow][newCol].color !== piece.color)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        } else {
            // Movimientos para otras piezas
            for (let [dr, dc] of directions[piece.type]) {
                let newRow = row + dr;
                let newCol = col + dc;
                
                while (this.isValidPosition(newRow, newCol)) {
                    if (!this.board[newRow][newCol]) {
                        moves.push({ row: newRow, col: newCol });
                    } else {
                        if (this.board[newRow][newCol].color !== piece.color) {
                            moves.push({ row: newRow, col: newCol });
                        }
                        break;
                    }
                    
                    // Las piezas que no sean reina, alfil o torre solo se mueven una casilla
                    if (piece.type === 'king') break;
                    
                    newRow += dr;
                    newCol += dc;
                }
            }
        }

        return moves;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        
        // Capturar pieza si existe
        if (this.board[toRow][toCol]) {
            const capturedPiece = this.board[toRow][toCol];
            this.capturedPieces[this.currentPlayer].push(capturedPiece);
        }

        // Mover pieza
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Verificar jaque mate (simplificado)
        this.checkGameOver();
        
        this.updateCapturedPiecesDisplay();
    }

    checkGameOver() {
        // Implementación básica - verificar si el rey fue capturado
        let whiteKing = false;
        let blackKing = false;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king') {
                    if (piece.color === 'white') whiteKing = true;
                    if (piece.color === 'black') blackKing = true;
                }
            }
        }

        if (!whiteKing) {
            this.gameOver = true;
            document.getElementById('status').textContent = '¡Jaque mate! Ganaron las negras';
        } else if (!blackKing) {
            this.gameOver = true;
            document.getElementById('status').textContent = '¡Jaque mate! Ganaron las blancas';
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    }

    updateGameInfo() {
        document.getElementById('current-player').textContent = 
            this.currentPlayer === 'white' ? 'Blancas' : 'Negras';
        
        if (this.selectedPiece) {
            document.getElementById('status').textContent = 
                `Pieza seleccionada: ${this.selectedPiece.piece.type}`;
        } else if (!this.gameOver) {
            document.getElementById('status').textContent = 
                `Turno de las ${this.currentPlayer === 'white' ? 'blancas' : 'negras'}`;
        }
    }

    updateCapturedPiecesDisplay() {
        document.getElementById('white-captured').textContent = 
            this.capturedPieces.white.map(p => this.getPieceSymbol(p)).join(' ');
        
        document.getElementById('black-captured').textContent = 
            this.capturedPieces.black.map(p => this.getPieceSymbol(p)).join(' ');
    }
}

// Inicializar el juego
let chessGame;

function initGame() {
    chessGame = new ChessGame();
}

function resetGame() {
    chessGame = new ChessGame();
}

// Iniciar el juego cuando se carga la página
window.onload = initGame;
