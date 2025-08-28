
        // Variables globales
        let currentGame = 'morpion';
        let gameMode = '2players'; // '2players' ou 'ai'
        let aiDifficulty = 'easy'; // 'easy', 'medium', 'hard'
        let aiThinking = false;

        // GESTION DES JEUX
        function showGame(game) {
            // Masquer tous les jeux
            document.querySelectorAll('.game-area').forEach(area => {
                area.classList.remove('active');
            });
            
            // Masquer tous les boutons actifs
            document.querySelectorAll('.game-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Afficher le jeu sélectionné
            document.getElementById(game).classList.add('active');
            event.target.classList.add('active');
            currentGame = game;
        }

        function changeGameMode() {
            gameMode = document.querySelector('input[name="gameMode"]:checked').value;
            const aiDifficultyDiv = document.getElementById('ai-difficulty');
            
            if (gameMode === 'ai') {
                aiDifficultyDiv.style.display = 'block';
            } else {
                aiDifficultyDiv.style.display = 'none';
            }
            
            // Redémarrer les jeux pour appliquer le nouveau mode
            restartTicTacToe();
            restartConnect4();
        }

        function changeDifficulty() {
            aiDifficulty = document.getElementById('difficulty-select').value;
        }

        // ===== MORPION =====
        let ticBoard = Array(9).fill('');
        let ticCurrentPlayer = 'X';
        let ticGameActive = true;

        function initTicTacToe() {
            const boardElement = document.getElementById('tic-board');
            boardElement.innerHTML = '';
            
            for (let i = 0; i < 9; i++) {
                const cell = document.createElement('button');
                cell.className = 'tic-cell';
                cell.onclick = () => makeTicMove(i);
                boardElement.appendChild(cell);
            }
        }

        function makeTicMove(index) {
            if (ticBoard[index] !== '' || !ticGameActive || aiThinking) return;
            
            ticBoard[index] = ticCurrentPlayer;
            updateTicDisplay();
            
            if (checkTicWinner()) {
                document.getElementById('tic-status').textContent = `Joueur ${ticCurrentPlayer} gagne !`;
                ticGameActive = false;
                return;
            } else if (ticBoard.every(cell => cell !== '')) {
                document.getElementById('tic-status').textContent = 'Match nul !';
                ticGameActive = false;
                return;
            }
            
            ticCurrentPlayer = ticCurrentPlayer === 'X' ? 'O' : 'X';
            document.getElementById('current-player').textContent = ticCurrentPlayer;
            
            // Si c'est le mode IA et c'est le tour de l'IA (O)
            if (gameMode === 'ai' && ticCurrentPlayer === 'O' && ticGameActive) {
                aiThinking = true;
                document.getElementById('tic-status').textContent = 'IA réfléchit...';
                document.getElementById('tic-status').className = 'ai-thinking';
                
                setTimeout(() => {
                    makeAITicMove();
                    aiThinking = false;
                    document.getElementById('tic-status').textContent = '';
                    document.getElementById('tic-status').className = '';
                }, 1000);
            }
        }

        function updateTicDisplay() {
            const cells = document.querySelectorAll('.tic-cell');
            cells.forEach((cell, index) => {
                cell.textContent = ticBoard[index];
                cell.style.color = ticBoard[index] === 'X' ? '#2196F3' : '#f44336';
            });
        }

        function checkTicWinner() {
            const winPatterns = [
                [0,1,2], [3,4,5], [6,7,8], // lignes
                [0,3,6], [1,4,7], [2,5,8], // colonnes
                [0,4,8], [2,4,6] // diagonales
            ];
            
            return winPatterns.some(pattern => {
                const [a, b, c] = pattern;
                return ticBoard[a] && ticBoard[a] === ticBoard[b] && ticBoard[a] === ticBoard[c];
            });
        }

        function restartTicTacToe() {
            ticBoard = Array(9).fill('');
            ticCurrentPlayer = 'X';
            ticGameActive = true;
            aiThinking = false;
            document.getElementById('current-player').textContent = 'X';
            document.getElementById('tic-status').textContent = '';
            document.getElementById('tic-status').className = '';
            updateTicDisplay();
        }

        // IA MORPION
        function makeAITicMove() {
            if (!ticGameActive) return;
            
            let move;
            
            switch (aiDifficulty) {
                case 'easy':
                    move = getRandomMove();
                    break;
                case 'medium':
                    move = Math.random() < 0.7 ? getBestTicMove() : getRandomMove();
                    break;
                case 'hard':
                    move = getBestTicMove();
                    break;
            }
            
            if (move !== -1) {
                ticBoard[move] = 'O';
                updateTicDisplay();
                
                if (checkTicWinner()) {
                    document.getElementById('tic-status').textContent = 'IA gagne !';
                    ticGameActive = false;
                } else if (ticBoard.every(cell => cell !== '')) {
                    document.getElementById('tic-status').textContent = 'Match nul !';
                    ticGameActive = false;
                } else {
                    ticCurrentPlayer = 'X';
                    document.getElementById('current-player').textContent = 'X';
                }
            }
        }

        function getRandomMove() {
            const availableMoves = [];
            for (let i = 0; i < 9; i++) {
                if (ticBoard[i] === '') availableMoves.push(i);
            }
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        function getBestTicMove() {
            // Vérifier si l'IA peut gagner
            for (let i = 0; i < 9; i++) {
                if (ticBoard[i] === '') {
                    ticBoard[i] = 'O';
                    if (checkTicWinner()) {
                        ticBoard[i] = '';
                        return i;
                    }
                    ticBoard[i] = '';
                }
            }
            
            // Vérifier si l'IA doit bloquer le joueur
            for (let i = 0; i < 9; i++) {
                if (ticBoard[i] === '') {
                    ticBoard[i] = 'X';
                    if (checkTicWinner()) {
                        ticBoard[i] = '';
                        return i;
                    }
                    ticBoard[i] = '';
                }
            }
            
            // Prendre le centre si disponible
            if (ticBoard[4] === '') return 4;
            
            // Prendre un coin
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(i => ticBoard[i] === '');
            if (availableCorners.length > 0) {
                return availableCorners[Math.floor(Math.random() * availableCorners.length)];
            }
            
            // Mouvement aléatoire
            return getRandomMove();
        }

        // ===== PUISSANCE 4 =====
        let connect4Board = Array(6).fill().map(() => Array(7).fill(''));
        let connect4CurrentPlayer = 'red';
        let connect4GameActive = true;

        function initConnect4() {
            const boardElement = document.getElementById('connect4-board');
            const buttonsElement = document.getElementById('column-buttons');
            
            boardElement.innerHTML = '';
            buttonsElement.innerHTML = '';
            
            // Boutons colonnes
            for (let col = 0; col < 7; col++) {
                const btn = document.createElement('button');
                btn.className = 'column-btn';
                btn.textContent = `↓`;
                btn.onclick = () => dropPiece(col);
                buttonsElement.appendChild(btn);
            }
            
            // Grille
            for (let row = 0; row < 6; row++) {
                for (let col = 0; col < 7; col++) {
                    const cell = document.createElement('div');
                    cell.className = 'connect4-cell empty';
                    cell.id = `cell-${row}-${col}`;
                    boardElement.appendChild(cell);
                }
            }
        }

        function dropPiece(col) {
            if (!connect4GameActive || aiThinking) return;
            
            // Trouver la ligne la plus basse disponible
            for (let row = 5; row >= 0; row--) {
                if (connect4Board[row][col] === '') {
                    connect4Board[row][col] = connect4CurrentPlayer;
                    updateConnect4Display();
                    
                    if (checkConnect4Winner(row, col)) {
                        const playerEmoji = connect4CurrentPlayer === 'red' ? '🔴' : '🟡';
                        document.getElementById('connect4-status').textContent = `Joueur ${playerEmoji} gagne !`;
                        connect4GameActive = false;
                        return;
                    } else if (connect4Board.every(row => row.every(cell => cell !== ''))) {
                        document.getElementById('connect4-status').textContent = 'Match nul !';
                        connect4GameActive = false;
                        return;
                    }
                    
                    connect4CurrentPlayer = connect4CurrentPlayer === 'red' ? 'yellow' : 'red';
                    document.getElementById('current-connect4-player').textContent = connect4CurrentPlayer === 'red' ? '🔴' : '🟡';
                    
                    // Si c'est le mode IA et c'est le tour de l'IA (yellow)
                    if (gameMode === 'ai' && connect4CurrentPlayer === 'yellow' && connect4GameActive) {
                        aiThinking = true;
                        document.getElementById('connect4-status').textContent = 'IA réfléchit...';
                        document.getElementById('connect4-status').className = 'ai-thinking';
                        
                        setTimeout(() => {
                            makeAIConnect4Move();
                            aiThinking = false;
                            document.getElementById('connect4-status').textContent = '';
                            document.getElementById('connect4-status').className = '';
                        }, 1500);
                    }
                    break;
                }
            }
        }

        function updateConnect4Display() {
            for (let row = 0; row < 6; row++) {
                for (let col = 0; col < 7; col++) {
                    const cell = document.getElementById(`cell-${row}-${col}`);
                    cell.className = `connect4-cell ${connect4Board[row][col] || 'empty'}`;
                }
            }
        }

        function checkConnect4Winner(row, col) {
            const directions = [
                [0, 1], [1, 0], [1, 1], [1, -1] // horizontal, vertical, diagonal
            ];
            
            const player = connect4Board[row][col];
            
            return directions.some(([dRow, dCol]) => {
                let count = 1;
                
                // Vérifier dans une direction
                for (let i = 1; i < 4; i++) {
                    const newRow = row + dRow * i;
                    const newCol = col + dCol * i;
                    if (newRow < 0 || newRow >= 6 || newCol < 0 || newCol >= 7) break;
                    if (connect4Board[newRow][newCol] !== player) break;
                    count++;
                }
                
                // Vérifier dans l'autre direction
                for (let i = 1; i < 4; i++) {
                    const newRow = row - dRow * i;
                    const newCol = col - dCol * i;
                    if (newRow < 0 || newRow >= 6 || newCol < 0 || newCol >= 7) break;
                    if (connect4Board[newRow][newCol] !== player) break;
                    count++;
                }
                
                return count >= 4;
            });
        }

        function restartConnect4() {
            connect4Board = Array(6).fill().map(() => Array(7).fill(''));
            connect4CurrentPlayer = 'red';
            connect4GameActive = true;
            aiThinking = false;
            document.getElementById('current-connect4-player').textContent = '🔴';
            document.getElementById('connect4-status').textContent = '';
            document.getElementById('connect4-status').className = '';
            updateConnect4Display();
        }

        // IA PUISSANCE 4
        function makeAIConnect4Move() {
            if (!connect4GameActive) return;
            
            let move;
            
            switch (aiDifficulty) {
                case 'easy':
                    move = getRandomConnect4Move();
                    break;
                case 'medium':
                    move = Math.random() < 0.7 ? getBestConnect4Move() : getRandomConnect4Move();
                    break;
                case 'hard':
                    move = getBestConnect4Move();
                    break;
            }
            
            if (move !== -1) {
                // Simuler le clic sur la colonne
                dropPieceAI(move);
            }
        }

        function dropPieceAI(col) {
            // Trouver la ligne la plus basse disponible
            for (let row = 5; row >= 0; row--) {
                if (connect4Board[row][col] === '') {
                    connect4Board[row][col] = 'yellow';
                    updateConnect4Display();
                    
                    if (checkConnect4Winner(row, col)) {
                        document.getElementById('connect4-status').textContent = 'IA 🟡 gagne !';
                        connect4GameActive = false;
                    } else if (connect4Board.every(row => row.every(cell => cell !== ''))) {
                        document.getElementById('connect4-status').textContent = 'Match nul !';
                        connect4GameActive = false;
                    } else {
                        connect4CurrentPlayer = 'red';
                        document.getElementById('current-connect4-player').textContent = '🔴';
                    }
                    break;
                }
            }
        }

        function getRandomConnect4Move() {
            const availableCols = [];
            for (let col = 0; col < 7; col++) {
                if (connect4Board[0][col] === '') availableCols.push(col);
            }
            return availableCols[Math.floor(Math.random() * availableCols.length)];
        }

        function getBestConnect4Move() {
            // Vérifier si l'IA peut gagner
            for (let col = 0; col < 7; col++) {
                if (canWinInColumn(col, 'yellow')) return col;
            }
            
            // Vérifier si l'IA doit bloquer le joueur
            for (let col = 0; col < 7; col++) {
                if (canWinInColumn(col, 'red')) return col;
            }
            
            // Privilégier le centre
            if (connect4Board[0][3] === '') return 3;
            
            // Colonnes proches du centre
            const centerCols = [2, 4, 1, 5, 0, 6];
            for (let col of centerCols) {
                if (connect4Board[0][col] === '') return col;
            }
            
            return getRandomConnect4Move();
        }

        function canWinInColumn(col, player) {
            // Vérifier si la colonne est pleine
            if (connect4Board[0][col] !== '') return false;
            
            // Trouver la ligne où la pièce tombera
            let row = 5;
            while (row >= 0 && connect4Board[row][col] !== '') {
                row--;
            }
            
            if (row < 0) return false;
            
            // Placer temporairement la pièce
            connect4Board[row][col] = player;
            const canWin = checkConnect4Winner(row, col);
            connect4Board[row][col] = ''; // Retirer la pièce
            
            return canWin;
        }

        // ===== PENDU =====
        const hangmanWords = [
            'JAVASCRIPT', 'PYTHON', 'ORDINATEUR', 'PROGRAMME', 'ALGORITHME',
            'VARIABLE', 'FONCTION', 'BOUCLE', 'CONDITION', 'TABLEAU',
            'INTERNET', 'NAVIGATEUR', 'SERVEUR', 'DATABASE', 'FRAMEWORK'
        ];
        
        let hangmanWord = '';
        let guessedLetters = [];
        let wrongGuesses = 0;
        let hangmanGameActive = true;

        const hangmanStages = [
            '',
            '  |\n  |\n  |\n  |\n__|__',
            '  +---+\n  |   |\n      |\n      |\n      |\n__|__',
            '  +---+\n  |   |\n  O   |\n      |\n      |\n__|__',
            '  +---+\n  |   |\n  O   |\n  |   |\n      |\n__|__',
            '  +---+\n  |   |\n  O   |\n /|   |\n      |\n__|__',
            '  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n__|__',
            '  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n__|__',
            '  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n__|__'
        ];

        function initHangman() {
            hangmanWord = hangmanWords[Math.floor(Math.random() * hangmanWords.length)];
            guessedLetters = [];
            wrongGuesses = 0;
            hangmanGameActive = true;
            
            updateHangmanDisplay();
            createAlphabet();
        }

        function createAlphabet() {
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const alphabetElement = document.getElementById('alphabet');
            alphabetElement.innerHTML = '';
            
            for (let letter of alphabet) {
                const btn = document.createElement('button');
                btn.className = 'letter-btn';
                btn.textContent = letter;
                btn.onclick = () => guessLetter(letter, btn);
                alphabetElement.appendChild(btn);
            }
        }

        function guessLetter(letter, btnElement) {
            if (!hangmanGameActive || guessedLetters.includes(letter)) return;
            
            guessedLetters.push(letter);
            btnElement.classList.add('used');
            
            if (hangmanWord.includes(letter)) {
                btnElement.style.background = '#4CAF50';
                btnElement.style.color = 'white';
            } else {
                wrongGuesses++;
                btnElement.classList.add('wrong');
            }
            
            updateHangmanDisplay();
            checkHangmanEnd();
        }

        function updateHangmanDisplay() {
            // Afficher le mot
            const display = hangmanWord.split('').map(letter => 
                guessedLetters.includes(letter) ? letter : '_'
            ).join(' ');
            document.getElementById('word-display').textContent = display;
            
            // Afficher le pendu
            document.getElementById('hangman-drawing').textContent = hangmanStages[wrongGuesses] || hangmanStages[hangmanStages.length - 1];
            
            // Afficher les erreurs
            document.getElementById('wrong-guesses').textContent = wrongGuesses;
        }

        function checkHangmanEnd() {
            const wordGuessed = hangmanWord.split('').every(letter => guessedLetters.includes(letter));
            
            if (wordGuessed) {
                document.getElementById('hangman-status').textContent = '🎉 Félicitations ! Vous avez gagné !';
                document.getElementById('hangman-status').style.color = '#4CAF50';
                hangmanGameActive = false;
            } else if (wrongGuesses >= 6) {
                document.getElementById('hangman-status').textContent = `💀 Perdu ! Le mot était: ${hangmanWord}`;
                document.getElementById('hangman-status').style.color = '#f44336';
                hangmanGameActive = false;
            }
        }

        function restartHangman() {
            document.getElementById('hangman-status').textContent = '';
            initHangman();
        }

        // INITIALISATION
        window.onload = function() {
            initTicTacToe();
            initConnect4();
            initHangman();
        };
    