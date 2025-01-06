const particlesConfig = {
  particles: {
    number: {
      value: 50,  // Número de partículas (bolas) en pantalla
      density: {
        enable: true,
        value_area: 800  // Área en la que se distribuyen
      }
    },
    color: {
      value: "#ffffff"  // Color de las partículas (blanco)
    },
    shape: {
      type: "circle"  // Forma de las partículas
    },
    opacity: {
      value: 0.5,  // Transparencia de las partículas
      random: false
    },
    size: {
      value: 3,  // Tamaño de las partículas
      random: true  // Tamaño aleatorio
    },
    line_linked: {
      enable: false  // Desactivamos las líneas entre partículas
    },
    move: {
      enable: true,
      speed: 1,  // Velocidad de movimiento
      direction: "none",  // Dirección aleatoria
      random: true,
      straight: false,
      out_mode: "out",
      bounce: false
    }
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: false  // Desactivada la interacción al pasar el mouse
      },
      onclick: {
        enable: false  // Desactivada la interacción al hacer clic
      },
      resize: true
    }
  },
  retina_detect: false
};

// Hacer la configuración disponible globalmente
window.particlesConfig = particlesConfig;

