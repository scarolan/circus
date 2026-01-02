// Main entry point - game initialization and loop

import { CANVAS_WIDTH, CANVAS_HEIGHT, SCALE } from './config.js';
import { input } from './input.js';
import { audio } from './audio.js';
import { Renderer } from './renderer.js';
import { Game } from './game.js';

// Initialize game
function init() {
    const canvas = document.getElementById('game-canvas');

    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Scale for display
    canvas.style.width = `${CANVAS_WIDTH * SCALE}px`;
    canvas.style.height = `${CANVAS_HEIGHT * SCALE}px`;

    // Bind input to canvas
    input.bindCanvas(canvas);

    // Initialize audio (will be resumed on first user interaction)
    audio.init();

    // Create renderer and game
    const renderer = new Renderer(canvas);
    const game = new Game(renderer);

    // Game loop
    let lastTime = 0;
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;

    function gameLoop(currentTime) {
        requestAnimationFrame(gameLoop);

        const deltaTime = currentTime - lastTime;

        if (deltaTime >= frameTime) {
            lastTime = currentTime - (deltaTime % frameTime);

            game.update();
            game.render();
        }
    }

    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
