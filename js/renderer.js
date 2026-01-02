// Canvas rendering utilities

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './config.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Disable image smoothing for crisp pixels
        this.ctx.imageSmoothingEnabled = false;
    }

    clear() {
        this.ctx.fillStyle = COLORS.background;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Draw text with retro pixel font style
    drawText(text, x, y, color = COLORS.text, size = 1) {
        this.ctx.fillStyle = color;
        this.ctx.font = `${8 * size}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(text, x, y);
    }

    drawTextLeft(text, x, y, color = COLORS.text, size = 1) {
        this.ctx.fillStyle = color;
        this.ctx.font = `${8 * size}px monospace`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(text, x, y);
    }

    // Draw the game HUD
    drawHUD(score, lives, level) {
        // Score
        this.drawTextLeft(`SCORE: ${score}`, 5, 5, COLORS.text);

        // Lives
        this.drawText(`LIVES: ${lives}`, CANVAS_WIDTH / 2, 5, COLORS.text);

        // Level
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`LEVEL: ${level}`, CANVAS_WIDTH - 5, 5);
    }

    // Draw title screen
    drawTitleScreen() {
        // Title
        this.drawText('CIRCUS', CANVAS_WIDTH / 2, 60, COLORS.textHighlight, 3);

        // Subtitle
        this.drawText('ATARI', CANVAS_WIDTH / 2, 95, COLORS.balloonRow1, 2);

        // Instructions
        this.drawText('USE ARROW KEYS OR MOUSE', CANVAS_WIDTH / 2, 140, COLORS.text);
        this.drawText('TO MOVE THE SEESAW', CANVAS_WIDTH / 2, 155, COLORS.text);

        // Start prompt (blinking)
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            this.drawText('PRESS SPACE TO START', CANVAS_WIDTH / 2, 200, COLORS.textHighlight);
        }

        // Credits
        this.drawText('A TRIBUTE TO ATARI 1980', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 15, '#666666');
    }

    // Draw game over screen
    drawGameOverScreen(score, highScore) {
        // Game Over text
        this.drawText('GAME OVER', CANVAS_WIDTH / 2, 80, COLORS.balloonRow1, 2);

        // Score
        this.drawText(`FINAL SCORE: ${score}`, CANVAS_WIDTH / 2, 130, COLORS.text);

        // High score
        if (score >= highScore) {
            this.drawText('NEW HIGH SCORE!', CANVAS_WIDTH / 2, 150, COLORS.textHighlight);
        } else {
            this.drawText(`HIGH SCORE: ${highScore}`, CANVAS_WIDTH / 2, 150, COLORS.text);
        }

        // Restart prompt
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            this.drawText('PRESS SPACE TO PLAY AGAIN', CANVAS_WIDTH / 2, 200, COLORS.textHighlight);
        }
    }

    // Draw level complete screen
    drawLevelCompleteScreen(level) {
        this.drawText('LEVEL COMPLETE!', CANVAS_WIDTH / 2, 100, COLORS.balloonRow2, 2);
        this.drawText(`STARTING LEVEL ${level + 1}`, CANVAS_WIDTH / 2, 150, COLORS.text);
    }

    // Draw ground line
    drawGround() {
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0, CANVAS_HEIGHT - 5, CANVAS_WIDTH, 5);
    }
}
