// Clown entity - the bouncing performer

import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    GRAVITY,
    BOUNCE_BASE,
    BOUNCE_EDGE_BONUS,
    MAX_VELOCITY_X,
    MAX_VELOCITY_Y,
    CLOWN_WIDTH,
    CLOWN_HEIGHT,
    CLOWN_START_X,
    CLOWN_START_Y,
    COLORS
} from '../config.js';

export class Clown {
    constructor(isSecondClown = false) {
        this.width = CLOWN_WIDTH;
        this.height = CLOWN_HEIGHT;
        this.isSecondClown = isSecondClown;
        this.color = isSecondClown ? COLORS.clownAlt : COLORS.clown;
        this.reset();
    }

    reset() {
        this.x = CLOWN_START_X - this.width / 2;
        this.y = CLOWN_START_Y;
        this.vx = (Math.random() - 0.5) * 2; // Slight random horizontal start
        this.vy = 0;
        this.active = true;
        this.onSeesaw = false;
    }

    update() {
        if (!this.active) return;

        // Apply gravity
        this.vy += GRAVITY;

        // Clamp velocities
        this.vx = Math.max(-MAX_VELOCITY_X, Math.min(MAX_VELOCITY_X, this.vx));
        this.vy = Math.max(-MAX_VELOCITY_Y, Math.min(MAX_VELOCITY_Y, this.vy));

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0) {
            this.x = 0;
            this.vx = -this.vx * 0.8;
        }
        if (this.x + this.width > CANVAS_WIDTH) {
            this.x = CANVAS_WIDTH - this.width;
            this.vx = -this.vx * 0.8;
        }

        // Bounce off ceiling
        if (this.y < 0) {
            this.y = 0;
            this.vy = -this.vy * 0.5;
        }
    }

    // Check if clown has fallen below the screen
    hasFallen() {
        return this.y > CANVAS_HEIGHT;
    }

    // Bounce off seesaw
    bounce(seesaw) {
        const multiplier = seesaw.getBounceMultiplier(this.getCenterX());
        this.vy = BOUNCE_BASE + (BOUNCE_EDGE_BONUS * multiplier);

        // Add slight horizontal velocity toward center tendency
        const seesawCenter = seesaw.getCenterX();
        const clownCenter = this.getCenterX();
        const diff = (clownCenter - seesawCenter) / seesaw.width;
        this.vx += diff * 2;

        // Position clown on top of seesaw
        this.y = seesaw.y - this.height;
    }

    getCenterX() {
        return this.x + this.width / 2;
    }

    getCenterY() {
        return this.y + this.height / 2;
    }

    // Get bounding box for collision
    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    render(ctx) {
        if (!this.active) return;

        // Body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 2, this.y + 6, this.width - 4, this.height - 6);

        // Head
        ctx.fillStyle = '#FFCCAA'; // Skin tone
        ctx.fillRect(this.x + 2, this.y, this.width - 4, 8);

        // Hair/hat (colorful)
        ctx.fillStyle = this.isSecondClown ? '#00FFFF' : '#FF0000';
        ctx.fillRect(this.x + 2, this.y, this.width - 4, 3);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 3, this.y + 4, 2, 2);
        ctx.fillRect(this.x + this.width - 5, this.y + 4, 2, 2);

        // Arms (out to the sides when falling)
        if (this.vy > 0) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - 2, this.y + 8, 3, 4);
            ctx.fillRect(this.x + this.width - 1, this.y + 8, 3, 4);
        }
    }
}
