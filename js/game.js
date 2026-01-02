// Core game logic and state machine

import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    SEESAW_Y,
    STARTING_LIVES,
    BONUS_LIFE_SCORE,
    GAME_STATES
} from './config.js';
import { input } from './input.js';
import { audio } from './audio.js';
import { Seesaw } from './entities/seesaw.js';
import { Clown } from './entities/clown.js';
import { BalloonGrid } from './entities/balloon.js';

export class Game {
    constructor(renderer) {
        this.renderer = renderer;
        this.state = GAME_STATES.MENU;

        // Game entities
        this.seesaw = new Seesaw();
        this.clown = new Clown(false);
        this.clown2 = new Clown(true);
        this.balloons = new BalloonGrid();

        // Game stats
        this.score = 0;
        this.lives = STARTING_LIVES;
        this.level = 1;
        this.highScore = this.loadHighScore();

        // Active clown tracking
        this.activeClown = this.clown;
        this.waitingClown = this.clown2;

        // Level complete timer
        this.levelCompleteTimer = 0;

        // For bonus life tracking
        this.nextBonusAt = BONUS_LIFE_SCORE;
    }

    loadHighScore() {
        try {
            return parseInt(localStorage.getItem('circusHighScore')) || 0;
        } catch {
            return 0;
        }
    }

    saveHighScore() {
        try {
            localStorage.setItem('circusHighScore', this.highScore.toString());
        } catch {
            // localStorage not available
        }
    }

    startGame() {
        this.state = GAME_STATES.PLAYING;
        this.score = 0;
        this.lives = STARTING_LIVES;
        this.level = 1;
        this.nextBonusAt = BONUS_LIFE_SCORE;

        this.seesaw = new Seesaw();
        this.clown.reset();
        this.clown2.reset();
        this.clown2.active = false; // Second clown waits
        this.activeClown = this.clown;
        this.waitingClown = this.clown2;

        this.balloons.reset();

        audio.playStart();
    }

    nextLevel() {
        this.level++;
        this.balloons.reset();

        // Reset clowns for new level
        this.clown.reset();
        this.clown2.reset();
        this.clown2.active = false;
        this.activeClown = this.clown;
        this.waitingClown = this.clown2;

        this.state = GAME_STATES.PLAYING;
    }

    loseLife() {
        this.lives--;
        audio.playDeath();

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Swap clowns - waiting clown becomes active
            this.swapClowns();

            // Reset the new active clown
            this.activeClown.reset();
        }
    }

    swapClowns() {
        const temp = this.activeClown;
        this.activeClown = this.waitingClown;
        this.waitingClown = temp;

        this.activeClown.active = true;
        this.waitingClown.active = false;
    }

    gameOver() {
        this.state = GAME_STATES.GAME_OVER;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        audio.playGameOver();
    }

    addScore(points) {
        this.score += points;

        // Check for bonus life
        if (this.score >= this.nextBonusAt) {
            this.lives++;
            this.nextBonusAt += BONUS_LIFE_SCORE;
        }
    }

    checkSeesawCollision() {
        if (!this.activeClown.active) return;

        const clown = this.activeClown;

        // Only check when clown is falling
        if (clown.vy <= 0) return;

        const clownBounds = clown.getBounds();

        // Check if clown is at seesaw height
        if (clownBounds.bottom >= this.seesaw.y &&
            clownBounds.bottom <= this.seesaw.y + this.seesaw.height + clown.vy) {

            // Check horizontal overlap
            if (clownBounds.right >= this.seesaw.x &&
                clownBounds.left <= this.seesaw.x + this.seesaw.width) {

                // Bounce!
                clown.bounce(this.seesaw);
                audio.playBounce();

                // Swap clowns on bounce
                this.swapClowns();
                this.activeClown.reset();
            }
        }
    }

    update() {
        // Handle state-specific input
        if (this.state === GAME_STATES.MENU) {
            if (input.consumeAction()) {
                this.startGame();
            }
            return;
        }

        if (this.state === GAME_STATES.GAME_OVER) {
            if (input.consumeAction()) {
                this.startGame();
            }
            return;
        }

        if (this.state === GAME_STATES.LEVEL_COMPLETE) {
            this.levelCompleteTimer--;
            if (this.levelCompleteTimer <= 0) {
                this.nextLevel();
            }
            return;
        }

        // Playing state
        this.seesaw.update();
        this.activeClown.update();
        this.balloons.update();

        // Check seesaw collision
        this.checkSeesawCollision();

        // Check balloon collisions
        const points = this.balloons.checkCollision(this.activeClown);
        if (points > 0) {
            this.addScore(points);
            audio.playPop();
        }

        // Check if clown fell
        if (this.activeClown.hasFallen()) {
            this.loseLife();
        }

        // Check level complete
        if (this.balloons.allPopped()) {
            this.state = GAME_STATES.LEVEL_COMPLETE;
            this.levelCompleteTimer = 120; // 2 seconds at 60fps
            audio.playLevelComplete();
        }
    }

    render() {
        this.renderer.clear();

        if (this.state === GAME_STATES.MENU) {
            this.renderer.drawTitleScreen();
            return;
        }

        if (this.state === GAME_STATES.GAME_OVER) {
            this.renderer.drawGameOverScreen(this.score, this.highScore);
            return;
        }

        if (this.state === GAME_STATES.LEVEL_COMPLETE) {
            this.renderer.drawLevelCompleteScreen(this.level);
            return;
        }

        // Draw game elements
        this.renderer.drawGround();
        this.balloons.render(this.renderer.ctx);
        this.seesaw.render(this.renderer.ctx);
        this.activeClown.render(this.renderer.ctx);

        // Draw waiting clown on seesaw
        if (!this.waitingClown.active) {
            this.waitingClown.x = this.seesaw.x + this.seesaw.width / 2 - this.waitingClown.width / 2;
            this.waitingClown.y = this.seesaw.y - this.waitingClown.height;
            this.waitingClown.active = true;
            this.waitingClown.render(this.renderer.ctx);
            this.waitingClown.active = false;
        }

        // Draw HUD
        this.renderer.drawHUD(this.score, this.lives, this.level);
    }
}
