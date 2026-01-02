// Seesaw entity - teeter-totter that launches clowns

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

        // Teeter-totter state: -1 = left down, 1 = right down
        this.tilt = -1; // Start with left side down
        this.tiltAngle = 0.2; // Visual tilt amount in radians

        // Track velocity for momentum transfer
        this.vx = 0;
        this.prevX = this.x;
    }

    update() {
        this.prevX = this.x;

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

        // Calculate velocity for momentum transfer
        this.vx = this.x - this.prevX;
    }

    render(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // Draw the fulcrum (triangle base)
        ctx.fillStyle = COLORS.seesawBase;
        ctx.beginPath();
        ctx.moveTo(centerX - 6, this.y + this.height + 12);
        ctx.lineTo(centerX + 6, this.y + this.height + 12);
        ctx.lineTo(centerX, this.y + this.height - 2);
        ctx.closePath();
        ctx.fill();

        // Draw tilted seesaw plank
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.tilt * this.tiltAngle);

        // Main plank
        ctx.fillStyle = COLORS.seesaw;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Highlight
        ctx.fillStyle = '#FFAA44';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, 2);

        // End markers to show landing zones
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(-this.width / 2, -this.height / 2, 4, this.height);
        ctx.fillRect(this.width / 2 - 4, -this.height / 2, 4, this.height);

        ctx.restore();
    }

    // Get the center X position
    getCenterX() {
        return this.x + this.width / 2;
    }

    // Get left end X position
    getLeftX() {
        return this.x + 8; // A bit inward from edge
    }

    // Get right end X position
    getRightX() {
        return this.x + this.width - 8;
    }

    // Get Y position at a given end, accounting for tilt
    getEndY(side) {
        // side: -1 for left, 1 for right
        const tiltOffset = this.tilt * side * Math.sin(this.tiltAngle) * (this.width / 2);
        return this.y - tiltOffset;
    }

    // Check which side of seesaw was hit (-1 left, 1 right)
    getSideHit(clownX) {
        const center = this.getCenterX();
        if (clownX < center) return -1; // Left side
        return 1; // Right side
    }

    // Get which side is currently UP (-1 = left up, 1 = right up)
    getUpSide() {
        return -this.tilt; // Opposite of tilt direction
    }

    // Get which side is currently DOWN
    getDownSide() {
        return this.tilt;
    }

    // Check if clown landed on the UP side (with margin)
    isOnUpSide(clownX, margin = 8) {
        const center = this.getCenterX();
        const upSide = this.getUpSide();

        if (upSide === -1) {
            // Left side is up - clown should be on left half
            return clownX < center + margin;
        } else {
            // Right side is up - clown should be on right half
            return clownX > center - margin;
        }
    }

    // Set tilt based on which side was landed on
    setTilt(side) {
        this.tilt = side; // -1 left down, 1 right down
    }

    // Get current horizontal velocity for momentum transfer
    getVelocity() {
        return this.vx;
    }
}
