// Seesaw entity - the player-controlled paddle

import {
    CANVAS_WIDTH,
    SEESAW_WIDTH,
    SEESAW_HEIGHT,
    SEESAW_Y,
    SEESAW_SPEED,
    COLORS
} from '../config.js';
import { input } from '../input.js';

export class Seesaw {
    constructor() {
        this.width = SEESAW_WIDTH;
        this.height = SEESAW_HEIGHT;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = SEESAW_Y;
        this.speed = SEESAW_SPEED;
    }

    update() {
        // Mouse control takes priority
        const mouseX = input.getMouseX();
        if (mouseX !== null) {
            // Center seesaw on mouse position
            this.x = mouseX - this.width / 2;
        } else {
            // Keyboard control
            if (input.isLeft()) {
                this.x -= this.speed;
            }
            if (input.isRight()) {
                this.x += this.speed;
            }
        }

        // Clamp to screen bounds
        this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));
    }

    render(ctx) {
        // Draw the seesaw base/fulcrum
        ctx.fillStyle = COLORS.seesawBase;
        const baseWidth = 8;
        const baseHeight = 10;
        ctx.fillRect(
            this.x + this.width / 2 - baseWidth / 2,
            this.y + this.height,
            baseWidth,
            baseHeight
        );

        // Draw the seesaw plank
        ctx.fillStyle = COLORS.seesaw;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Add a simple highlight
        ctx.fillStyle = '#FFAA44';
        ctx.fillRect(this.x, this.y, this.width, 2);
    }

    // Get the center X position
    getCenterX() {
        return this.x + this.width / 2;
    }

    // Check if a point is on the seesaw
    containsPoint(px, py) {
        return px >= this.x &&
               px <= this.x + this.width &&
               py >= this.y &&
               py <= this.y + this.height;
    }

    // Get bounce multiplier based on where clown lands (-1 to 1, edges = higher)
    getBounceMultiplier(clownX) {
        const relativeX = (clownX - this.x) / this.width; // 0 to 1
        const distFromCenter = Math.abs(relativeX - 0.5) * 2; // 0 at center, 1 at edges
        return distFromCenter;
    }
}
