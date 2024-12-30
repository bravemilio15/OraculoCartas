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
        this.autoPlayDelay = 1200;
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
        document.querySelector('.game-container').insertBefore(
            this.questionElement,
            document.querySelector('.game-board')
        );
        this.updateQuestionDisplay();
        
        // Create destiny message element
        this.destinyMessage = document.createElement('div');
        this.destinyMessage.className = 'destiny-message';
        document.body.appendChild(this.destinyMessage);
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
        const shuffledDeck = shuffledDeckData ? shuffledDeckData.map(cardData => new Card(cardData.id, cardData.number, cardData.symbol, cardData.color)) : [];

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
        if (revealed) cardDiv.classList.add('revealed');

        if (revealed || card.isRevealed) {
            const contentDiv = document.createElement('div');
            contentDiv.className = 'card-content';

            // Especial handling for cards 10-13
            let displaySymbol = card.symbol;
            let displayNumber = card.number;

            if (card.number === 10) displayNumber = '10';
            else if (card.number === 11) displayNumber = 'J';
            else if (card.number === 12) displayNumber = 'Q';
            else if (card.number === 13) displayNumber = 'K';

            contentDiv.setAttribute('data-value', `${displayNumber}${displaySymbol}`);
            contentDiv.innerHTML = `
                <span style="font-size: calc(var(--card-width) * 0.5); color: ${card.color}">
                    ${displaySymbol}
                </span>
            `;
            contentDiv.style.color = card.color;
            cardDiv.appendChild(contentDiv);
        }

        return cardDiv;
    }

    updateStackDisplay(position) {
        const stack = this.stacks.get(position);
        const stackElement = document.querySelector(`#slot-${position} .card-stack`);
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

        // Wait for reveal animation to complete
        await new Promise(resolve => {
            cardElement.addEventListener('animationend', () => {
                cardElement.classList.remove('revealing');
                resolve();
            });
        });

        if (card.number !== position) {
            await new Promise(resolve => setTimeout(resolve, 200));

            const targetStack = this.stacks.get(card.number);
            const sourceRect = cardElement.getBoundingClientRect();
            const targetElement = document.querySelector(`#slot-${card.number} .card-stack`);
            const targetRect = targetElement.getBoundingClientRect();

            document.querySelector(`#slot-${position}`).classList.remove('active');
            document.querySelector(`#slot-${card.number}`).classList.add('active');
            this.currentActivePosition = card.number;

            // Calculate the path for the floating animation
            const deltaX = targetRect.left - sourceRect.left;
            const deltaY = targetRect.top - sourceRect.top;
            
            cardElement.classList.add('card-moving');
            cardElement.classList.add('in-transit');

            // Enhanced floating animation
            await new Promise(resolve => {
                // First animation: Rise up
                gsap.to(cardElement, {
                    y: -50,
                    duration: 0.3,
                    ease: "power2.out",
                    onStart: () => {
                        cardElement.style.background = 'white'; // Force white background at start
                        cardElement.style.transformStyle = 'flat';
                    },
                    onComplete: () => {
                        // Second animation: Move to target
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

            stack.revealedCards.pop();
            targetStack.revealedCards.push(card);
            this.updateStackDisplay(position);
            this.updateStackDisplay(card.number);
        }
    } else {
        document.querySelector(`#slot-${position}`).classList.remove('active');
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
            stackElement.addEventListener('click', () => {
                if (!this.isAutoPlaying) {
                    if (this.isViewingCards && i !== this.currentActivePosition) {
                        this.showCardsFan(i);
                    } else {
                        this.revealCard(i);
                    }
                }
            });
        }

        this.restartButton.addEventListener('click', () => {
            this.initializeGame();
        });

        this.autoPlayButton.addEventListener('click', () => {
            this.toggleAutoPlay();
        });

        this.viewCardsButton.addEventListener('click', () => {
            if (!this.isAutoPlaying) {
                this.toggleViewCards();
            }
        });

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
        const isStack13Complete = stack13.cards.length === 0 &&
            stack13.revealedCards.every(card => card.number === 13);

        let otherStacksComplete = true;
        for (let i = 1; i <= 12; i++) {
            const stack = this.stacks.get(i);
            if (stack.cards.length > 0 ||
                !stack.revealedCards.every(card => card.number === i)) {
                otherStacksComplete = false;
                break;
            }
        }

        if (isStack13Complete && !otherStacksComplete) {
            this.stopTimer();
            this.showLossMessage();
            return;
        }

        if (otherStacksComplete && !isStack13Complete) {
            this.stopTimer();
            this.showVictoryMessage();
            return;
        }
    }

    showVictoryMessage() {
        const messageElement = document.getElementById('message');
        const finalTime = this.timerElement.textContent;
        messageElement.textContent = `¡Has ganado!\n\nTiempo: ${finalTime}\nMovimientos: ${this.moves}\n\nEl Oráculo ha determinado que tu deseo SE CUMPLIRÁ.`;
        messageElement.style.display = 'block';
        messageElement.classList.add('visible');
        messageElement.style.backgroundColor = 'rgba(0,100,0,0.85)';
        document.querySelector('.game-board').classList.add('victory');
        
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
        messageElement.appendChild(document.createElement('br'));
        messageElement.appendChild(buttonsContainer);
        
        this.restartButton.style.display = 'none';
        this.stopAutoPlay();
    }

    showLossMessage() {
        const messageElement = document.getElementById('message');
        const finalTime = this.timerElement.textContent;
        messageElement.textContent = `¡Has perdido!\n\nTiempo: ${finalTime}\nMovimientos: ${this.moves}\n\nEl Oráculo ha determinado que tu deseo NO SE CUMPLIRÁ.`;
        messageElement.style.display = 'block';
        messageElement.classList.add('visible');
        messageElement.style.backgroundColor = 'rgba(200,0,0,0.85)';
        document.querySelector('.game-board').classList.add('loss');
        
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
        messageElement.appendChild(document.createElement('br'));
        messageElement.appendChild(buttonsContainer);
        
        this.restartButton.style.display = 'none';
        this.stopAutoPlay();
    }

    setupResizeHandler() {
        const calculateScale = () => {
            const gameBoard = document.querySelector('.game-board');
            const container = document.querySelector('.game-container');
            if (!gameBoard || !container) return;

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
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.autoPlayButton.textContent = 'Juego Automático';
});

