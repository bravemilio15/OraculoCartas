let animationFrameId = null;
let isAnimating = false;
let currentGameCards = null;

function crearMazo() {
    const numeros = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const simbolos = ['♠', '♥', '♦', '♣'];
    const colores = ['negro', 'rojo', 'rojo', 'negro'];
    const mazo = [];

    for (let i = 0; i < simbolos.length; i++) {
        for (let j = 0; j < numeros.length; j++) {
            mazo.push({
                number: numeros[j],
                symbol: simbolos[i],
                color: colores[i]
            });
        }
    }

    return mazo;
}

function mezcladoManual(deck) {
    const mezclado = [...deck];
    const timestamp = Date.now();
    let seed = timestamp;

    for (let i = mezclado.length - 1; i > 0; i--) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        const j = seed % (i + 1);
        [mezclado[i], mezclado[j]] = [mezclado[j], mezclado[i]];
    }
    return mezclado;
}

function crearCarta(numero, simbolo, color) {
    const carta = document.createElement('div');
    carta.className = `poker-card ${color}`;
    
    // Crear el frente de la carta
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    cardFront.innerHTML = `
        <div class="card-corner top-left">
            <div>${numero}</div>
            <div>${simbolo}</div>
        </div>
        <div class="card-center">${simbolo}</div>
        <div class="card-corner bottom-right">
            <div>${numero}</div>
            <div>${simbolo}</div>
        </div>
    `;
    
    // Crear el reverso de la carta
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    
    // Añadir frente y reverso a la carta
    carta.appendChild(cardFront);
    carta.appendChild(cardBack);
    
    return carta;
}

function iniciarBarajado() {
    if (isAnimating) return;
    
    const questionPopup = document.getElementById('questionPopup');
    if (questionPopup) {
        questionPopup.style.display = 'none';
    }
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    setTimeout(() => {
        if (!isAnimating) {
            animarBarajado();
        }
    }, 100);
}

function animarBarajado() {
    isAnimating = true;
    const cardDeck = document.getElementById('cardDeck');
    cardDeck.innerHTML = '';
    
    const oldDecoration = document.querySelector('.background-decoration');
    if (oldDecoration) {
        oldDecoration.remove();
    }
    
    const backgroundDecoration = document.createElement('div');
    backgroundDecoration.className = 'background-decoration';
    backgroundDecoration.innerHTML = `
        <div class="mystic-circle"></div>
        <div class="mystic-circle" style="width: 400px; height: 400px; animation-duration: 15s;"></div>
        <div class="mystic-circle" style="width: 300px; height: 300px; animation-duration: 10s;"></div>
    `;
    document.body.appendChild(backgroundDecoration);
    
    const deck = crearMazo();
    const barajado = mezcladoManual(deck);
    
    currentGameCards = barajado.map((card, index) => ({
        ...card,
        position: index + 1,
        pileIndex: Math.floor(index / 4)
    }));
    
    const fragment = document.createDocumentFragment();
    const cardWidth = 90;
    const cardHeight = cardWidth * 1.4;
    
    const batchSize = 10;
    let currentBatch = 0;
    
    function createNextBatch() {
        const start = currentBatch * batchSize;
        const end = Math.min(start + batchSize, currentGameCards.length);
        
        for (let i = start; i < end; i++) {
            const card = currentGameCards[i];
            const cardElement = crearCarta(card.number, card.symbol, card.color);
            fragment.appendChild(cardElement);
            
            cardElement.style.width = cardWidth + 'px';
            cardElement.style.height = cardHeight + 'px';
            cardElement.dataset.position = card.position;
            cardElement.dataset.pile = card.pileIndex;

            gsap.set(cardElement, {
                x: 0,
                y: 0,
                scale: 1,
                opacity: 1,
                rotation: 0,
                transformOrigin: "50% 50%"
            });
        }
        
        if (end === currentGameCards.length) {
            cardDeck.appendChild(fragment);
            iniciarAnimacionCartas();
        } else {
            currentBatch++;
            animationFrameId = requestAnimationFrame(createNextBatch);
        }
    }
    
    createNextBatch();
}

function iniciarAnimacionCartas() {
    const cards = document.querySelectorAll('.poker-card');
    const halfDeck = Math.floor(cards.length / 2);
    const leftPile = Array.from(cards).slice(0, halfDeck);
    const rightPile = Array.from(cards).slice(halfDeck);

    gsap.set(leftPile, { x: -150, y: 0 });
    gsap.set(rightPile, { x: 150, y: 0 });

    let isDropping = false;

    async function dropCards(pile, direction) {
        if (isDropping) return;
        isDropping = true;

        return new Promise((resolve) => {
            const cardsToDrop = (pile.length % 3) + 1;
            const droppedCards = pile.slice(0, cardsToDrop);

            gsap.to(droppedCards, {
                duration: 0.1,
                y: 200,
                x: direction * 50,
                rotation: () => (pile.length * 5) - 30,
                stagger: 0.1,
                ease: "power1.in",
                onComplete: () => {
                    isDropping = false;
                    resolve();
                }
            });

            pile.splice(0, cardsToDrop);
        });
    }

    async function alternateDrop() {
        while (leftPile.length > 0 && rightPile.length > 0) {
            await dropCards(leftPile, -1);
            if (rightPile.length > 0) {
                await dropCards(rightPile, 1);
            }
        }

        const allCards = document.querySelectorAll('.poker-card');
        
        gsap.to(allCards, {
            duration: 0.7,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            stagger: {
                amount: 0.5,
                from: "center"
            },
            ease: "back.out(1.2)",
            onComplete: () => {
                gsap.to(allCards, {
                    duration: 0.3,
                    rotationY: 180,
                    stagger: {
                        amount: 0.3,
                        from: "center"
                    },
                    onComplete: () => {
                        allCards.forEach(card => card.classList.add('flipped'));
                        const organizedDeck = currentGameCards.map(card => ({
                            id: card.position,
                            number: card.number,
                            symbol: card.symbol,
                            color: card.color,
                            pile: card.pileIndex
                        }));
                        localStorage.setItem('shuffledDeck', JSON.stringify(organizedDeck));
                        isAnimating = false;
                        mostrarBotones();
                    }
                });
            }
        });
    }

    alternateDrop();
}


function mostrarBotones() {
    const buttonsContainer = document.getElementById('buttonsContainer');
    if (buttonsContainer) {
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.opacity = '1';
        buttonsContainer.style.zIndex = '1000';
    } else {
        console.error('No se encontró el contenedor de botones');
        // Crear el contenedor si no existe
        const newButtonsContainer = document.createElement('div');
        newButtonsContainer.id = 'buttonsContainer';
        newButtonsContainer.className = 'botones-container';
        newButtonsContainer.innerHTML = `
            <button class="boton-baraja" onclick="window.location.href='game.html'">Continuar</button>
            <button class="boton-baraja" onclick="window.iniciarBarajado()">Barajear de nuevo</button>
        `;
        document.body.appendChild(newButtonsContainer);
        newButtonsContainer.style.display = 'flex';
        newButtonsContainer.style.opacity = '1';
        newButtonsContainer.style.zIndex = '1000';
    }
}

function limpiarAnimaciones() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    isAnimating = false;
    gsap.killTweensOf(".poker-card");
}

window.iniciarBarajado = iniciarBarajado;
window.animarBarajado = animarBarajado;
window.mostrarBotones = mostrarBotones;

window.addEventListener('unload', limpiarAnimaciones);

