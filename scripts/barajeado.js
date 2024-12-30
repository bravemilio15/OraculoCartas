document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submitQuestion');
    if (submitButton) {
        submitButton.addEventListener('click', iniciarBarajado);
    }
});

function iniciarBarajado() {
    const questionPopup = document.getElementById('questionPopup');
    const questionInput = document.getElementById('question');
    
    if (!questionInput || !questionPopup) {
        console.error('Elementos del formulario no encontrados');
        return;
    }
    
    const question = questionInput.value;
    
    if (question.trim() !== '') {
        localStorage.setItem('oracleQuestion', question);
        questionPopup.style.display = 'none';
        
        // Pequeño retraso para asegurar que la transición del popup sea suave
        setTimeout(() => {
            animarBarajado();
        }, 100);
    } else {
        alert('Por favor, escribe una pregunta antes de continuar.');
    }
}

function crearCarta(numero, simbolo, color) {
    const carta = document.createElement('div');
    carta.className = 'poker-card';
    
    // Crear el contenido de la carta
    const contenido = document.createElement('div');
    contenido.className = 'card-content';
    
    // Convertir números especiales a letras
    let displayNumber = numero;
    if (numero === 1) displayNumber = 'A';
    if (numero === 11) displayNumber = 'J';
    if (numero === 12) displayNumber = 'Q';
    if (numero === 13) displayNumber = 'K';
    
    contenido.innerHTML = `
        <div class="card-corner top-left">
            <div class="card-number" style="color: ${color}">${displayNumber}</div>
            <div class="card-symbol" style="color: ${color}">${simbolo}</div>
        </div>
        <div class="card-center" style="color: ${color}">
            ${simbolo}
        </div>
        <div class="card-corner bottom-right">
            <div class="card-number" style="color: ${color}">${displayNumber}</div>
            <div class="card-symbol" style="color: ${color}">${simbolo}</div>
        </div>
    `;
    
    carta.appendChild(contenido);
    
    // Añadir el reverso de la carta
    const reverso = document.createElement('div');
    reverso.className = 'card-back';
    carta.appendChild(reverso);
    
    return carta;
}

function mezcladoManual(deck) {
    let shuffled = [...deck];
    
    // Obtener un valor único para esta sesión de mezclado
    const timestamp = Date.now();
    const sessionCount = parseInt(localStorage.getItem('shuffleCount') || '0') + 1;
    localStorage.setItem('shuffleCount', sessionCount.toString());
    
    // Crear valores de variación usando timestamp y contador de sesión
    const variation1 = timestamp % 13; // Variación para el número de pilas
    const variation2 = sessionCount % 7; // Variación para el patrón de intercalado
    const variation3 = (timestamp % 23) + 11; // Variación para el punto de corte
    
    // Paso 1: División en pilas con número variable
    const numPilas = 7 + variation1 % 4; // Entre 7 y 10 pilas
    const pilas = Array.from({ length: numPilas }, () => []);
    
    // Distribuir cartas en pilas con patrón variable
    shuffled.forEach((carta, index) => {
        const pilaIndex = (index + variation2) % numPilas;
        pilas[pilaIndex].push(carta);
    });
    
    // Paso 2: Intercalar pilas con patrón variable
    let resultado = [];
    let currentPile = variation2;
    
    while (pilas.some(pila => pila.length > 0)) {
        if (pilas[currentPile].length > 0) {
            resultado.push(pilas[currentPile].shift());
        }
        // Patrón de salto variable
        currentPile = (currentPile + variation2 + 3) % numPilas;
    }
    
    // Paso 3: Cortes múltiples variables
    const numCortes = (variation1 + variation2) % 3 + 2; // 2-4 cortes
    for (let i = 0; i < numCortes; i++) {
        const cutPoint = ((variation3 * (i + 1)) + (timestamp % (resultado.length - 10))) % resultado.length;
        resultado = [...resultado.slice(cutPoint), ...resultado.slice(0, cutPoint)];
    }
    
    // Paso 4: Intercalado final con patrón variable
    const partes = [];
    const tamañoParte = Math.floor(resultado.length / (variation2 % 3 + 2));
    for (let i = 0; i < resultado.length; i += tamañoParte) {
        partes.push(resultado.slice(i, i + tamañoParte));
    }
    
    resultado = [];
    const maxLength = Math.max(...partes.map(p => p.length));
    for (let i = 0; i < maxLength; i++) {
        partes.forEach(parte => {
            if (i < parte.length) {
                resultado.push(parte[i]);
            }
        });
    }
    
    // Verificación de integridad
    const verificacion = new Set(resultado.map(carta => `${carta.number}${carta.symbol}`));
    if (verificacion.size !== 52) {
        console.error('Error en el barajado: hay cartas duplicadas o faltantes');
        return deck; // Retornar mazo original si hay error
    }
    
    return resultado;
}

function crearMazo() {
    const deck = [];
    // Crear 13 montones de 4 cartas cada uno
    for (let number = 1; number <= 13; number++) {
        const pileCards = [];
        // Crear las 4 cartas de cada número (una de cada palo)
        const symbols = ['♥', '♠', '♦', '♣'];
        const colors = ['red', 'black'];
        
        for (let i = 0; i < 4; i++) {
            const symbol = symbols[i];
            const color = i % 2 === 0 ? colors[0] : colors[1];
            pileCards.push({ number, symbol, color });
        }
        deck.push(...pileCards);
    }
    return deck;
}


function animarBarajado() {
    const cardDeck = document.getElementById('cardDeck');
    cardDeck.innerHTML = '';
    
    // Limpiar decoración de fondo anterior si existe
    const oldDecoration = document.querySelector('.background-decoration');
    if (oldDecoration) {
        oldDecoration.remove();
    }
    
    // Añadir decoración de fondo
    const backgroundDecoration = document.createElement('div');
    backgroundDecoration.className = 'background-decoration';
    backgroundDecoration.innerHTML = `
        <div class="mystic-circle"></div>
        <div class="mystic-circle" style="width: 400px; height: 400px; animation-duration: 15s;"></div>
        <div class="mystic-circle" style="width: 300px; height: 300px; animation-duration: 10s;"></div>
    `;
    document.body.appendChild(backgroundDecoration);
    
    const question = localStorage.getItem('oracleQuestion') || '¿Cuál es mi destino?';
    const deck = crearMazo();
    const barajado = mezcladoManual(deck);
    
    // Organizar las cartas en el formato específico del juego
    const gameCards = barajado.map((card, index) => ({
        ...card,
        position: index + 1, // Posición en el reloj (1-12) o centro (13)
        pileIndex: Math.floor(index / 4) // Índice del montón (0-12)
    }));
    
    const cardWidth = 90;
    const cardHeight = cardWidth * 1.4;
    
    // Crear y posicionar las cartas inicialmente
    gameCards.forEach((card, index) => {
        const cardElement = crearCarta(card.number, card.symbol, card.color);
        cardDeck.appendChild(cardElement);
        
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
    });

    const cards = document.querySelectorAll('.poker-card');
    
    // Dividir el mazo en dos pilas para la animación
    const halfDeck = Math.floor(cards.length / 2);
    const leftPile = Array.from(cards).slice(0, halfDeck);
    const rightPile = Array.from(cards).slice(halfDeck);

    gsap.set(leftPile, { x: -150, y: 0 });
    gsap.set(rightPile, { x: 150, y: 0 });

    // Función para dejar caer cartas de una pila
    function dropCards(pile, direction) {
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
                onComplete: resolve
            });

            pile.splice(0, cardsToDrop);
        });
    }

    // Animación de caída alternada
    async function alternateDrop() {
        while (leftPile.length > 0 && rightPile.length > 0) {
            await dropCards(leftPile, -1);
            if (rightPile.length > 0) {
                await dropCards(rightPile, 1);
            }
        }

        // Recoger todas las cartas
        const allCards = document.querySelectorAll('.poker-card');
        gsap.to(allCards, {
            duration: 0.7,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            stagger: 0.01,
            ease: "back.out(1.2)",
            onComplete: () => {
                gsap.to(allCards, {
                    duration: 0.3,
                    rotationY: 180,
                    stagger: 0.01,
                    onComplete: () => {
                        // Guardar el mazo organizado en localStorage
                        const organizedDeck = gameCards.map(card => ({
                            id: card.position,
                            number: card.number,
                            symbol: card.symbol,
                            color: card.color,
                            pile: card.pileIndex
                        }));
                        localStorage.setItem('shuffledDeck', JSON.stringify(organizedDeck));
                        mostrarBotones();
                    }
                });
            }
        });
    }

    alternateDrop();
}

function mostrarBotones() {
    if (document.querySelector('.botones-container')) {
        document.querySelector('.botones-container').remove();
    }

    const botonesContainer = document.createElement('div');
    botonesContainer.className = 'botones-container';
    
    const botonContinuar = document.createElement('button');
    botonContinuar.textContent = 'Continuar';
    botonContinuar.className = 'boton-baraja';
    botonContinuar.onclick = () => {
        window.location.href = 'game.html';
    };

    const botonBarajearDeNuevo = document.createElement('button');
    botonBarajearDeNuevo.textContent = 'Barajear de nuevo';
    botonBarajearDeNuevo.className = 'boton-baraja';
    botonBarajearDeNuevo.onclick = () => {
        document.querySelector('.botones-container').remove();
        animarBarajado();
    };

    botonesContainer.appendChild(botonContinuar);
    botonesContainer.appendChild(botonBarajearDeNuevo);
    document.body.appendChild(botonesContainer);
}

document.getElementById('submitQuestion').addEventListener('click', iniciarBarajado);

