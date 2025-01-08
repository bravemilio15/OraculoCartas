class Card {
    constructor(id, number, symbol, color) {
        this.id = id;
        this.number = number;
        this.symbol = symbol;
        this.color = color;
        this.isFlipped = false;
        this.isRevealed = false;
        this.isVisible = false;
    }

    toString() {
        return `${this.number}${this.symbol}`;
    }
}

class CardStack {
    constructor(position) {
        this.position = position;
        this.cards = [];
        this.revealedCards = [];
    }

    addCard(card) {
        this.cards.push(card);
    }

    revealCard() {
        if (this.cards.length === 0) return null;
        const card = this.cards.pop();
        card.isRevealed = true;
        this.revealedCards.push(card);
        return card;
    }

    getTopCard() {
        return this.cards[this.cards.length - 1];
    }
}

class Game {
    constructor() {
        this.stacks = new Map();
        this.moves = 0;
        this.movesElement = document.getElementById('moves');
        this.restartButton = document.getElementById('restart-button');
        this.autoPlayButton = document.getElementById('auto-play-button');
        this.isAutoPlaying = false;
        this.autoPlayDelay = 400; //cambio de Velocidad juego automático 1200
        this.viewCardsButton = document.getElementById('view-cards-button');
        this.cardsPopup = document.getElementById('cards-popup');
        this.cardsFan = document.getElementById('cards-fan');
        this.isViewingCards = false;
        this.initializeGame();
        this.setupEventListeners();
        this.setupResizeHandler();
        this.question = localStorage.getItem('oracleQuestion') || '';
        this.questionElement = document.createElement('div');
        this.questionElement.className = 'oracle-question';

        if (!this.movesElement || !this.restartButton || !this.autoPlayButton || !this.viewCardsButton || !this.cardsPopup || !this.cardsFan) {
            console.error('Uno o más elementos del DOM no se encontraron. Verifica los IDs en el HTML.');
        }
        
        document.querySelector('.game-container').insertBefore(
            this.questionElement,
            document.querySelector('.game-board')
        );
        this.updateQuestionDisplay();
        
        // Create destiny message element
        this.destinyMessage = document.createElement('div');
        this.destinyMessage.className = 'destiny-message';
        document.body.appendChild(this.destinyMessage);

        console.log('Constructor: Setting up ESC key listener');
        this.handleEscKey = this.handleEscKey.bind(this);
        document.addEventListener('keydown', this.handleEscKey);

    }

    handleEscKey(event) {
    console.log('Key pressed:', event.key);
    if (event.key === 'Escape') {
        console.log('ESC key detected');
        const messageElement = document.getElementById('message');
        console.log('Message element display state:', messageElement?.style.display);
        if (messageElement && messageElement.style.display !== 'none') {
            console.log('Attempting to close message via ESC');
            this.closeMessage();
        }
    }
}

closeMessage() {
    console.log('closeMessage function called');
    const messageElement = document.getElementById('message');
    console.log('Found message element:', messageElement);
    
    if (messageElement) {
        console.log('Before closing - Display style:', messageElement.style.display);
        messageElement.style.display = 'none';
        messageElement.classList.remove('visible');
        console.log('After closing - Display style:', messageElement.style.display);
        
        // Enable viewing cards after closing message
        for (let i = 1; i <= 13; i++) {
            const slot = document.querySelector(`#slot-${i}`);
            console.log(`Updating slot ${i}:`, slot);
            if (slot) {
                slot.classList.remove('game-over');
                slot.style.cursor = 'pointer';
            }
        }
    } else {
        console.log('Message element not found');
    }
}

    updateQuestionDisplay() {
        this.questionElement.textContent = this.question;
    }

    initializeGame() {
        this.stacks = new Map();
        this.initializeStacks();
        this.initializeCards();
        this.currentActivePosition = 13;
        document.querySelector(`#slot-13`).classList.add('active');
        this.isAnimating = false;
        this.highestZIndex = 1000;
        this.gameStarted = false;
        this.startTime = null;
        this.timerInterval = null;
        this.timerElement = document.getElementById('timer');
        this.moves = 0;
        this.updateMovesDisplay();
        this.stopAutoPlay();

        document.getElementById('message').style.display = 'none';
        this.restartButton.style.display = 'none';
        document.querySelector('.game-board').classList.remove('victory', 'loss');

        for (let i = 1; i <= 13; i++) {
            const slot = document.querySelector(`#slot-${i}`);
            slot.classList.remove('active', 'inactive', 'auto-play-active');
        }
        document.querySelector(`#slot-13`).classList.add('active');

        const messageElement = document.getElementById('message');
        messageElement.style.display = 'none';
        messageElement.classList.remove('visible');
    }

    updateMovesDisplay() {
        this.movesElement.textContent = this.moves;
    }

    startTimer() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTime = new Date();
            this.timerInterval = setInterval(() => {
                const currentTime = new Date();
                const elapsedTime = new Date(currentTime - this.startTime);
                const minutes = elapsedTime.getMinutes().toString().padStart(2, '0');
                const seconds = elapsedTime.getSeconds().toString().padStart(2, '0');
                this.timerElement.textContent = `${minutes}:${seconds}`;
            }, 1000);
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    initializeStacks() {
        for (let i = 1; i <= 13; i++) {
            this.stacks.set(i, new CardStack(i));
        }
    }

    initializeCards() {
        const shuffledDeckData = JSON.parse(localStorage.getItem('shuffledDeck'));
        const shuffledDeck = shuffledDeckData ? shuffledDeckData.map(cardData => {
            const number = this.convertCardNumberToInt(cardData.number);
            return new Card(cardData.id, number, cardData.symbol, cardData.color);
        }) : [];

        console.log("Combinación de cartas después del barajado:");
        let output = "";
        for (let i = 0; i < shuffledDeck.length; i++) {
            output += shuffledDeck[i].toString() + " ";
            if ((i + 1) % 13 === 0) {
                console.log(output.trim());
                output = "";
            }
        }
        if (output.trim() !== "") {
            console.log(output.trim());
        }
        console.log("------ Fin de la combinación ------");

        for (let i = 1; i <= 13; i++) {
            const stack = this.stacks.get(i);
            for (let j = 0; j < 4; j++) {
                if (shuffledDeck.length > 0) {
                    stack.addCard(shuffledDeck.pop());
                }
            }
            this.updateStackDisplay(i);
        }

        localStorage.removeItem('shuffledDeck');
    }

    createCardElement(card, revealed = false) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        
        if (revealed || card.isRevealed) {
            cardDiv.classList.add('revealed');
            const contentDiv = document.createElement('div');
            contentDiv.className = 'card-content';
    
            // Convert card numbers to display values
            const displayNumber = {
                'A': 'A',
                '1': 'A',
                '11': 'J',
                '12': 'Q',
                '13': 'K',
                '10': '10'
            }[card.number] || card.number;
    
            // Create the front face structure
            const cardFront = document.createElement('div');
            cardFront.className = `card-front ${card.color === 'rojo' ? 'rojo' : 'negro'}`;
            
            // Add corner values (top-left and bottom-right)
            const topLeftCorner = document.createElement('div');
            topLeftCorner.className = 'card-corner top-left';
            topLeftCorner.innerHTML = `
                <div>${displayNumber}</div>
                <div>${card.symbol}</div>
            `;
    
            const bottomRightCorner = document.createElement('div');
            bottomRightCorner.className = 'card-corner bottom-right';
            bottomRightCorner.innerHTML = `
                <div>${displayNumber}</div>
                <div>${card.symbol}</div>
            `;
    
            // Add center symbol
            const centerSymbol = document.createElement('div');
            centerSymbol.className = 'card-center';
            centerSymbol.textContent = card.symbol;
    
            // Assemble the card front
            cardFront.appendChild(topLeftCorner);
            cardFront.appendChild(centerSymbol);
            cardFront.appendChild(bottomRightCorner);
    
            // Create card back
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
    
            // Add front and back to card
            cardDiv.appendChild(cardFront);
            cardDiv.appendChild(cardBack);
        } else {
            // For unrevealed cards, add the back directly
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            cardDiv.appendChild(cardBack);
        }
    
        return cardDiv;
    }

 

    updateStackDisplay(position) {
        const stack = this.stacks.get(position);
        const stackElement = document.querySelector(`#slot-${position} .card-stack`);
        if (!stackElement) {
            console.error(`Elemento de stack no encontrado para la posición ${position}`);
            return;
        }
        stackElement.innerHTML = '';

        [...stack.revealedCards].reverse().forEach((card, index) => {
            const cardElement = this.createCardElement(card, true);
            cardElement.style.zIndex = index + 1;
            stackElement.appendChild(cardElement);
        });

        stack.cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card);
            cardElement.style.zIndex = stack.revealedCards.length + index + 1;
            stackElement.appendChild(cardElement);
        });
    }

    async revealCard(position) {
        if (this.isGameOver) return;
        if (this.isAnimating) return;
        if (this.currentActivePosition !== position) {
            return;
        }
    
        this.startTimer();
        this.moves++;
        this.updateMovesDisplay();
    
        this.isAnimating = true;
        this.highestZIndex += 100;
    
        const stack = this.stacks.get(position);
        const card = stack.revealCard();
    
        if (card) {
            card.isVisible = true;
            const cardElement = this.createCardElement(card, true);
            cardElement.style.zIndex = this.highestZIndex;
            cardElement.classList.add('revealing');
    
            const stackElement = document.querySelector(`#slot-${position} .card-stack`);
            stackElement.appendChild(cardElement);
    
            await new Promise(resolve => {
                cardElement.addEventListener('animationend', () => {
                    cardElement.classList.remove('revealing');
                    resolve();
                });
            });
    
            if (card.number !== position) {
                await new Promise(resolve => setTimeout(resolve, 200));
    
                const targetNumber = typeof card.number === 'number' ? card.number : this.convertCardNumberToInt(card.number);
                const targetStack = this.stacks.get(targetNumber);
                const targetElement = document.querySelector(`#slot-${targetNumber} .card-stack`);
                
                if (!targetElement) {
                    console.error(`Target element for card number ${card.number} not found`);
                    this.isAnimating = false;
                    return;
                }
                
                const sourceRect = cardElement.getBoundingClientRect();
                const targetRect = targetElement.getBoundingClientRect();
    
                const currentSlot = document.querySelector(`#slot-${position}`);
                const targetSlot = document.querySelector(`#slot-${targetNumber}`);
                
                if (currentSlot) currentSlot.classList.remove('active');
                if (targetSlot) targetSlot.classList.add('active');
                
                this.currentActivePosition = targetNumber;
    
                const deltaX = targetRect.left - sourceRect.left;
                const deltaY = targetRect.top - sourceRect.top;
                
                cardElement.classList.add('card-moving');
                cardElement.classList.add('in-transit');
    
                await new Promise(resolve => {
                    gsap.to(cardElement, {
                        y: -50,
                        duration: 0.3,
                        ease: "power2.out",
                        onStart: () => {
                            cardElement.style.transform = 'rotateY(180deg)';
                        },
                        onComplete: () => {
                            gsap.to(cardElement, {
                                x: deltaX,
                                y: deltaY,
                                duration: 0.8,
                                ease: "power2.inOut",
                                onComplete: () => {
                                    cardElement.classList.remove('card-moving', 'in-transit');
                                    resolve();
                                }
                            });
                        }
                    });
                });
    
                try {
                    targetStack.revealedCards.push(card);
                    
                    // Verificar si todas las K están en la posición 13
                    if (targetNumber === 13) {
                        const kingsInPosition = targetStack.revealedCards.filter(c => c.number === 13).length;
                        if (kingsInPosition === 4) { // Si todas las K están en posición
                            await new Promise(resolve => setTimeout(resolve, 500));
                            this.stopTimer();
                            this.showLossMessage();
                            this.endGame();
                            return;
                        }
                    }
                    
                } catch (error) {
                    console.error(`Error pushing card to target stack: ${error.message}`);
                    this.isAnimating = false;
                    return;
                }
                stack.revealedCards.pop();
                this.updateStackDisplay(position);
                this.updateStackDisplay(targetNumber);
            }
        } else {
            const currentSlot = document.querySelector(`#slot-${position}`);
            if (currentSlot) currentSlot.classList.remove('active');
            this.currentActivePosition = null;
        }
    
        this.isAnimating = false;
        this.checkVictory();
    }
    
 

    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    async startAutoPlay() {
        if (this.isAutoPlaying) return;

        this.isAutoPlaying = true;
        this.autoPlayButton.textContent = 'STOP';
        this.autoPlayButton.classList.add('playing');
        this.viewCardsButton.disabled = true;
        this.removeSlotHighlights();
        this.hideCardsFan();

        const autoPlay = async () => {
            if (!this.isAutoPlaying) return;
            if (this.isAnimating) {
                setTimeout(autoPlay, 100);
                return;
            }

            if (this.currentActivePosition !== null) {
                await this.revealCard(this.currentActivePosition);
                if (this.isAutoPlaying) {
                    setTimeout(autoPlay, this.autoPlayDelay);
                }
            }
        };

        autoPlay();
    }

    stopAutoPlay() {
        this.isAutoPlaying = false;
        this.autoPlayButton.textContent = 'Juego Automático';
        this.autoPlayButton.classList.remove('playing');
        this.viewCardsButton.disabled = false;
    }

    toggleViewCards() {
        if (this.isAutoPlaying) return;
        
        this.isViewingCards = !this.isViewingCards;
        this.viewCardsButton.classList.toggle('active', this.isViewingCards);
        
        if (this.isViewingCards) {
            this.highlightViewableSlots();
        } else {
            this.removeSlotHighlights();
        }
    }

    highlightViewableSlots() {
        for (let i = 1; i <= 13; i++) {
            if (i !== this.currentActivePosition) {
                document.querySelector(`#slot-${i}`).classList.add('viewable');
            }
        }
    }

    removeSlotHighlights() {
        for (let i = 1; i <= 13; i++) {
            document.querySelector(`#slot-${i}`).classList.remove('viewable');
        }
    }

    showCardsFan(position) {
        if (!this.isViewingCards || this.isAutoPlaying) return;

        const stack = this.stacks.get(position);
        const allCards = [...stack.cards, ...stack.revealedCards];

        this.cardsFan.innerHTML = '';

        // Calculate the total spread angle and angle per card
        const totalCards = allCards.length;
        const maxSpread = Math.min(60, totalCards * 15);
        const anglePerCard = maxSpread / (totalCards - 1 || 1);
        const startAngle = -maxSpread / 2;

        allCards.forEach((card, index) => {
            // Create card element with visibility state
            const cardElement = this.createCardElement(card, card.isVisible);
            cardElement.classList.add('fan-card');
        
            // Add face-down class if card is not visible
            if (!card.isVisible) {
                cardElement.classList.add('face-down');
                // Remove any content from face-down cards
                cardElement.innerHTML = '';
            }

            // Calculate the angle and offset for this card
            const angle = startAngle + (anglePerCard * index);
            const translateY = Math.abs(angle) * -1;
            const translateZ = Math.abs(angle) * 2;

            cardElement.style.transform = `
                rotate(${angle}deg)
                translateY(${translateY}px)
                translateZ(${translateZ}px)
            `;
            cardElement.style.zIndex = index;

            this.cardsFan.appendChild(cardElement);
        });

        this.cardsPopup.style.display = 'flex';
    }

    hideCardsFan() {
        this.cardsPopup.style.display = 'none';
        // Reset the view cards button state
        this.isViewingCards = false;
        this.viewCardsButton.classList.remove('active');
        this.removeSlotHighlights();
    }

    setupEventListeners() {
        for (let i = 1; i <= 13; i++) {
            const stackElement = document.querySelector(`#slot-${i}`);
            if (stackElement) {
                stackElement.addEventListener('click', () => {
                    if (!this.isAutoPlaying) {
                        if (this.isViewingCards && i !== this.currentActivePosition) {
                            this.showCardsFan(i);
                        } else {
                            this.revealCard(i);
                        }
                    }
                });
            } else {
                console.error(`Elemento de slot no encontrado para la posición ${i}`);
            }
        }
    
        if (this.restartButton) {
            this.restartButton.addEventListener('click', () => {
                this.initializeGame();
            });
        }
    
        if (this.autoPlayButton) {
            this.autoPlayButton.addEventListener('click', () => {
                this.toggleAutoPlay();
            });
        }
    
        if (this.viewCardsButton) {
            this.viewCardsButton.addEventListener('click', () => {
                if (!this.isAutoPlaying) {
                    this.toggleViewCards();
                }
            });
        }

        document.querySelector('.close-popup').addEventListener('click', () => {
            this.hideCardsFan();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCardsFan();
            }
        });
        this.cardsPopup.addEventListener('click', (e) => {
            if (e.target === this.cardsPopup) {
                this.hideCardsFan();
            }
        });
    }

    checkVictory() {
        const stack13 = this.stacks.get(13);
        
        // Verificar si todas las K están en la posición 13
        const kingsInPosition13 = stack13.revealedCards.filter(card => card.number === 13).length;
        const isStack13Complete = stack13.cards.length === 0 && kingsInPosition13 === 4;
    
        let otherStacksComplete = true;
        for (let i = 1; i <= 12; i++) {
            const stack = this.stacks.get(i);
            if (stack.cards.length > 0 ||
                !stack.revealedCards.every(card => card.number === i)) {
                otherStacksComplete = false;
                break;
            }
        }
    
        if (otherStacksComplete && !isStack13Complete) {
            this.stopTimer();
            this.showVictoryMessage();
            this.endGame();
            return;
        }
    
        // Si todas las K están en posición 13, es derrota
        if (isStack13Complete) {
            this.stopTimer();
            this.showLossMessage();
            this.endGame();
            return;
        }
    }
    
    endGame() {
        this.isGameOver = true;
        this.autoPlayButton.style.display = 'none';
        this.viewCardsButton.style.cssText = 'display: block; margin: 0 auto;';
        
        // Instead of disabling pointer-events completely, we'll add a class
        for (let i = 1; i <= 13; i++) {
            const slot = document.querySelector(`#slot-${i}`);
            slot.classList.add('game-over');
        }
    }
    
    showVictoryMessage() {
        console.log('Showing victory message');
        const messageElement = document.getElementById('message');
        if (!messageElement) {
            console.error('Elemento de mensaje no encontrado');
            return;
        }
        const finalTime = this.timerElement.textContent;
        messageElement.innerHTML = `
            <div class="message-content">
                <button type="button" class="close-message" aria-label="Cerrar">&times;</button>
                <p>¡Has ganado!</p>
                <p>Tiempo: ${finalTime}</p>
                <p>Movimientos: ${this.moves}</p>
                <p>El Oráculo ha determinado que tu deseo SE CUMPLIRÁ.</p>
            </div>
        `;
        messageElement.style.display = 'block';
        messageElement.classList.add('visible');
        messageElement.style.backgroundColor = 'rgba(0,100,0,0.85)';
        
        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'game-buttons';
        
        // Create "Preguntar otra vez" button
        const askAgainButton = document.createElement('button');
        askAgainButton.textContent = 'Preguntar otra vez';
        askAgainButton.className = 'game-button';
        askAgainButton.onclick = () => window.location.href = 'baraja.html';
        
        // Create "Intentar de nuevo" button
        const tryAgainButton = document.createElement('button');
        tryAgainButton.textContent = 'Intentar de nuevo';
        tryAgainButton.className = 'game-button';
        tryAgainButton.onclick = () => {
            this.destinyMessage.textContent = 'El destino ya se ha decidido y no puede ser cambiado. Así lo dicta el Oráculo.';
            this.destinyMessage.style.display = 'block';
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 3000);
        };
        
        // Add buttons to container
        buttonsContainer.appendChild(askAgainButton);
        buttonsContainer.appendChild(tryAgainButton);
        
        // Add buttons container after message
        messageElement.querySelector('.message-content').appendChild(buttonsContainer);
        
        this.restartButton.style.display = 'none';
        this.stopAutoPlay();
    
        // Add event listener for close button
        const closeButton = messageElement.querySelector('.close-message');
        console.log('Close button found:', closeButton);
        if (closeButton) {
            console.log('Adding click listener to close button');
            closeButton.addEventListener('click', (e) => {
                console.log('Close button clicked');
                e.preventDefault();
                e.stopPropagation();
                this.closeMessage();
            });
        }
    }
    
    showLossMessage() {
        console.log('Showing loss message');
        const messageElement = document.getElementById('message');
        if (!messageElement) {
            console.error('Elemento de mensaje no encontrado');
            return;
        }
        const finalTime = this.timerElement.textContent;
        messageElement.innerHTML = `
            <div class="message-content">
                <button type="button" class="close-message" aria-label="Cerrar">&times;</button>
                <p>¡Has perdido!</p>
                <p>Tiempo: ${finalTime}</p>
                <p>Movimientos: ${this.moves}</p>
                <p>El Oráculo ha determinado que tu deseo NO SE CUMPLIRÁ.</p>
            </div>
        `;
        messageElement.style.display = 'flex';  // Cambiado de 'block' a 'flex'
        messageElement.classList.add('visible');
        messageElement.style.backgroundColor = 'rgba(200,0,0,0.85)';

        console.log('Message element after setup:', messageElement.outerHTML);
        
        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'game-buttons';
        
        // Create "Preguntar otra vez" button
        const askAgainButton = document.createElement('button');
        askAgainButton.textContent = 'Preguntar otra vez';
        askAgainButton.className = 'game-button';
        askAgainButton.onclick = () => window.location.href = 'baraja.html';
        
        // Create "Intentar de nuevo" button
        const tryAgainButton = document.createElement('button');
        tryAgainButton.textContent = 'Intentar de nuevo';
        tryAgainButton.className = 'game-button';
        tryAgainButton.onclick = () => {
            this.destinyMessage.textContent = 'El destino ya se ha decidido y no puede ser cambiado. Así lo dicta el Oráculo.';
            this.destinyMessage.style.display = 'block';
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 3000);
        };
        
        // Add buttons to container
        buttonsContainer.appendChild(askAgainButton);
        buttonsContainer.appendChild(tryAgainButton);
        
        // Add buttons container after message
        messageElement.querySelector('.message-content').appendChild(buttonsContainer);
        
        this.restartButton.style.display = 'none';
        this.stopAutoPlay();
    
        // Add event listener for close button
        const closeButton = messageElement.querySelector('.close-message');
        console.log('Close button found:', closeButton);
        if (closeButton) {
        console.log('Adding click listener to close button');
        closeButton.addEventListener('click', (e) => {
            console.log('Close button clicked');
            e.preventDefault();
            e.stopPropagation();
            this.closeMessage();
        });
    }
}

    destroy() {
        document.removeEventListener('keydown', this.handleEscKey);
    }

    setupResizeHandler() {
        const calculateScale = () => {
            const gameBoard = document.querySelector('.game-board');
            const container = document.querySelector('.game-container');
            if (!gameBoard || !container) {
                console.error('Elementos de tablero de juego o contenedor no encontrados');
                return;
            }

            const boardRect = gameBoard.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const horizontalScale = (containerRect.width * 0.9) / boardRect.width;
            const verticalScale = (containerRect.height * 0.7) / boardRect.height;

            const scale = Math.min(horizontalScale, verticalScale, 1);
            gameBoard.style.transform = `scale(${scale})`;
        };

        window.addEventListener('resize', calculateScale);
        
        setTimeout(calculateScale, 100);
    }

    convertCardNumberToInt(cardNumber) {
        const conversion = {
            'J': 11,
            'Q': 12,
            'K': 13,
            'A': 1
        };
        return conversion[cardNumber] || parseInt(cardNumber, 10);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.autoPlayButton.textContent = 'Juego Automático';
});

