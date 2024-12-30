class EyeAnimation {
    constructor() {
        this.iris = document.querySelector('.oracle-iris');
        this.maxMovement = 6; 
        this.boundingBox = {
            top: -6,
            bottom: 6,
            left: -6,
            right: 6
        };
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        this.iris.style.transform = 'translate(-50%, -50%)';
    }

    handleMouseMove(e) {
        const eyeRect = this.iris.parentElement.parentElement.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const deltaX = mouseX - eyeCenterX;
        const deltaY = mouseY - eyeCenterY;
        const angle = Math.atan2(deltaY, deltaX);
        
        const distance = Math.min(Math.hypot(deltaX, deltaY), 50); // Reducido para movimiento más contenido
        const movementFactor = distance / 50;

        let moveX = Math.cos(angle) * this.maxMovement * movementFactor * this.easeOutQuad(movementFactor);
        let moveY = Math.sin(angle) * this.maxMovement * movementFactor * this.easeOutQuad(movementFactor);

        moveX = Math.max(this.boundingBox.left, Math.min(this.boundingBox.right, moveX));
        moveY = Math.max(this.boundingBox.top, Math.min(this.boundingBox.bottom, moveY));

        requestAnimationFrame(() => {
            this.iris.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
        });
    }

    easeOutQuad(t) {
        return t * (2 - t);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EyeAnimation();
});

