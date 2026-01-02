// Input handling for keyboard and mouse

class InputManager {
    constructor() {
        this.keys = {};
        this.mouseX = 0;
        this.mouseActive = false;
        this.actionPressed = false; // Space/Enter for start/restart

        this.setupKeyboard();
        this.setupMouse();
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (e.code === 'Space' || e.code === 'Enter') {
                this.actionPressed = true;
                e.preventDefault();
            }

            // Prevent arrow key scrolling
            if (e.code.startsWith('Arrow')) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    setupMouse(canvas) {
        this.canvas = canvas;
    }

    bindCanvas(canvas) {
        this.canvas = canvas;

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseActive = true;
        });

        canvas.addEventListener('mouseleave', () => {
            this.mouseActive = false;
        });

        canvas.addEventListener('click', () => {
            this.actionPressed = true;
        });
    }

    isLeft() {
        return this.keys['ArrowLeft'] || this.keys['KeyA'];
    }

    isRight() {
        return this.keys['ArrowRight'] || this.keys['KeyD'];
    }

    getMouseX() {
        return this.mouseActive ? this.mouseX : null;
    }

    consumeAction() {
        if (this.actionPressed) {
            this.actionPressed = false;
            return true;
        }
        return false;
    }
}

export const input = new InputManager();
