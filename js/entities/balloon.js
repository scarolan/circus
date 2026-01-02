// Balloon grid management

import {
    CANVAS_WIDTH,
    BALLOON_ROWS,
    BALLOONS_PER_ROW,
    BALLOON_WIDTH,
    BALLOON_HEIGHT,
    BALLOON_START_Y,
    BALLOON_SPACING_X,
    BALLOON_SPACING_Y,
    BALLOON_POINTS,
    COLORS
} from '../config.js';

export class BalloonGrid {
    constructor() {
        this.balloons = [];
        this.popAnimations = []; // For pop effects
        this.reset();
    }

    reset() {
        this.balloons = [];
        this.popAnimations = [];

        const rowColors = [COLORS.balloonRow1, COLORS.balloonRow2, COLORS.balloonRow3];
        const totalWidth = BALLOONS_PER_ROW * BALLOON_SPACING_X;
        const startX = (CANVAS_WIDTH - totalWidth) / 2 + BALLOON_SPACING_X / 2;

        for (let row = 0; row < BALLOON_ROWS; row++) {
            for (let col = 0; col < BALLOONS_PER_ROW; col++) {
                this.balloons.push({
                    x: startX + col * BALLOON_SPACING_X,
                    y: BALLOON_START_Y + (BALLOON_ROWS - 1 - row) * BALLOON_SPACING_Y,
                    width: BALLOON_WIDTH,
                    height: BALLOON_HEIGHT,
                    row: row,
                    color: rowColors[row],
                    points: BALLOON_POINTS[row],
                    active: true
                });
            }
        }
    }

    // Check collision with clown and return points scored
    checkCollision(clown) {
        const clownBounds = clown.getBounds();
        let totalPoints = 0;

        for (const balloon of this.balloons) {
            if (!balloon.active) continue;

            // Simple AABB collision
            if (clownBounds.right > balloon.x - balloon.width / 2 &&
                clownBounds.left < balloon.x + balloon.width / 2 &&
                clownBounds.bottom > balloon.y - balloon.height / 2 &&
                clownBounds.top < balloon.y + balloon.height / 2) {

                balloon.active = false;
                totalPoints += balloon.points;

                // Add pop animation
                this.popAnimations.push({
                    x: balloon.x,
                    y: balloon.y,
                    color: balloon.color,
                    frame: 0,
                    maxFrames: 10
                });
            }
        }

        return totalPoints;
    }

    // Check if all balloons are popped
    allPopped() {
        return this.balloons.every(b => !b.active);
    }

    // Count remaining balloons
    remainingCount() {
        return this.balloons.filter(b => b.active).length;
    }

    update() {
        // Update pop animations
        this.popAnimations = this.popAnimations.filter(anim => {
            anim.frame++;
            return anim.frame < anim.maxFrames;
        });
    }

    render(ctx) {
        // Draw balloons
        for (const balloon of this.balloons) {
            if (!balloon.active) continue;

            // Balloon body (oval shape approximated with rectangles)
            ctx.fillStyle = balloon.color;

            // Main body
            ctx.fillRect(
                balloon.x - balloon.width / 2 + 2,
                balloon.y - balloon.height / 2,
                balloon.width - 4,
                balloon.height
            );

            // Sides
            ctx.fillRect(
                balloon.x - balloon.width / 2,
                balloon.y - balloon.height / 2 + 2,
                balloon.width,
                balloon.height - 4
            );

            // Highlight
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.3;
            ctx.fillRect(
                balloon.x - balloon.width / 2 + 3,
                balloon.y - balloon.height / 2 + 2,
                4,
                4
            );
            ctx.globalAlpha = 1;

            // String
            ctx.fillStyle = '#888888';
            ctx.fillRect(
                balloon.x - 1,
                balloon.y + balloon.height / 2,
                2,
                4
            );
        }

        // Draw pop animations
        for (const anim of this.popAnimations) {
            const progress = anim.frame / anim.maxFrames;
            const size = BALLOON_WIDTH * (1 + progress);

            ctx.fillStyle = anim.color;
            ctx.globalAlpha = 1 - progress;

            // Explosion particles
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 + progress * 2;
                const dist = progress * 20;
                const px = anim.x + Math.cos(angle) * dist;
                const py = anim.y + Math.sin(angle) * dist;
                ctx.fillRect(px - 2, py - 2, 4, 4);
            }

            ctx.globalAlpha = 1;
        }
    }
}
