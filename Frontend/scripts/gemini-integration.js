async function consultarOraculo(pregunta) {
    try {
        console.log('Consultando al oráculo con la pregunta:', pregunta);
        const response = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: `Actúa como un oráculo místico que puede predecir el futuro. Tu tarea es:

1. Analizar si la pregunta puede ser respondida con "Sí" o "No".
2. Las preguntas válidas incluyen:
   - Preguntas sobre el futuro que pueden responderse con Sí/No (ej: "¿Me irá bien mañana?", "¿Aprobaré el examen?")
   - Preguntas sobre decisiones (ej: "¿Debería tomar el trabajo?")
   - Preguntas sobre situaciones actuales o pasadas que pueden responderse con Sí/No
3. Las preguntas inválidas incluyen:
   - Preguntas abiertas que requieren explicaciones (ej: "¿Qué pasará mañana?", "¿Cómo será mi futuro?")
   - Preguntas que piden detalles específicos (ej: "¿Cuándo encontraré trabajo?")

Si la pregunta es válida (puede responderse con Sí/No), responde ÚNICAMENTE con "Sí" o "No".
Si la pregunta es inválida, responde ÚNICAMENTE con "Inválida".

Pregunta: "${pregunta}"`
            })
        });

        if (!response.ok) {
            throw new Error('Error en la conexión con el oráculo');
        }

        const data = await response.json();
        console.log('Respuesta del oráculo:', data.response);
        return data.response.trim();
    } catch (error) {
        console.error('Error al consultar el oráculo:', error);
        return 'Error';
    }
}

function validarRespuesta(respuesta) {
    return respuesta === 'Sí' || respuesta === 'No';
}

function mostrarPopup(mensaje, tipo = 'error') {
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

document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submitQuestion');
    const questionInput = document.getElementById('question');
    const questionPopup = document.getElementById('questionPopup');

    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const pregunta = questionInput.value.trim();

            if (!pregunta) {
                mostrarPopup('Por favor, escribe una pregunta antes de continuar.');
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Consultando al oráculo...';

            try {
                const respuesta = await consultarOraculo(pregunta);

                if (validarRespuesta(respuesta)) {

                    localStorage.setItem('oracleResponse', respuesta);
                    localStorage.setItem('oracleQuestion', pregunta);
                    window.iniciarBarajado(); 
                } else {
                    mostrarPopup('Tu pregunta debe poder responderse con Sí o No. Por ejemplo: "¿Me irá bien mañana?" o "¿Aprobaré el examen?". Reformula tu pregunta.');
                }
            } catch (error) {
                console.error('Error al procesar la respuesta del oráculo:', error);
                mostrarPopup('El oráculo no puede responder en este momento. Inténtalo de nuevo más tarde.');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Continuar';
            }
        });
    }
});

function mostrarInterpretacion() {
    const interpretationPopup = document.getElementById('interpretationPopup');
    const interpretationText = document.getElementById('interpretationText');
    const respuesta = localStorage.getItem('oracleResponse');

    if (respuesta && interpretationPopup && interpretationText) {
        interpretationText.textContent = respuesta;
        interpretationPopup.style.display = 'flex';
    }
}

window.mostrarInterpretacion = mostrarInterpretacion;

