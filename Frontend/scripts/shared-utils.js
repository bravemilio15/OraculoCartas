export function mostrarPopup(mensaje, tipo = 'error') {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
        <div class="popup-content ${tipo}">
            <h2>${tipo === 'error' ? 'Error' : 'Mensaje'}</h2>
            <p>${mensaje}</p>
            <button class="oracle-button" onclick="this.parentElement.parentElement.remove()">Cerrar</button>
        </div>
    `;
    document.body.appendChild(popup);
}



