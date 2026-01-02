// Core game logic and state machine - Teeter-totter mechanics

import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    SEESAW_Y,
    STARTING_LIVES,
    BONUS_LIFE_SCORE,
    GAME_STATES,
    BOUNCE_BASE,
    BOUNCE_EDGE_BONUS,
    CLOWN_WIDTH,
    CLOWN_HEIGHT
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
        this.clowns = [new Clown(false), new Clown(true)];
        this.balloons = new BalloonGrid();

        // Game stats
        this.score = 0;
        this.lives = STARTING_LIVES;
        this.level = 1;
        this.highScore = this.loadHighScore();

        // Clown states: one is flying, one is waiting on seesaw (on the DOWN side)
        this.flyingClownIndex = 0;
        this.waitingClownIndex = 1;

        // Level complete timer
        this.levelCompleteTimer = 0;

        // For bonus life tracking
        this.nextBonusAt = BONUS_LIFE_SCORE;
    }

    get flyingClown() {
        return this.clowns[this.flyingClownIndex];
    }

    get waitingClown() {
        return this.clowns[this.waitingClownIndex];
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
        this.balloons.reset();

        // Set up initial clown positions
        // Clown 0 starts in the air, Clown 1 waits on the DOWN side of seesaw
        this.flyingClownIndex = 0;
        this.waitingClownIndex = 1;

        // Seesaw starts tilted left-down, so waiting clown is on left (down) side
        this.seesaw.setTilt(-1); // Left side down

        // Flying clown starts from top
        this.flyingClown.reset();
        this.flyingClown.active = true;

        // Waiting clown sits on the down side of seesaw
        this.waitingClown.active = false;

        audio.playStart();
    }

    nextLevel() {
        this.level++;
        this.balloons.reset();

        // Reset for new level - flying clown starts from top
        this.flyingClown.reset();
        this.flyingClown.active = true;
        this.waitingClown.active = false;

        this.state = GAME_STATES.PLAYING;
    }

    launchWaitingClown(landingSide) {
        // The clown that was waiting (on the DOWN side) gets launched
        const launchedClown = this.waitingClown;
        const landingClown = this.flyingClown;

        // Calculate launch velocity based on how fast the landing clown was going
        const launchPower = BOUNCE_BASE + (BOUNCE_EDGE_BONUS * Math.abs(landingClown.vy) / 10);

        // Launched clown comes from the DOWN side (opposite of where landing occurred)
        const downSide = this.seesaw.getDownSide();
        const launchX = downSide === -1 ? this.seesaw.getLeftX() : this.seesaw.getRightX();

        launchedClown.x = launchX - CLOWN_WIDTH / 2;
        launchedClown.y = this.seesaw.y - CLOWN_HEIGHT;
        launchedClown.vy = launchPower;

        // Add seesaw momentum to horizontal velocity, plus slight outward push
        const seesawMomentum = this.seesaw.getVelocity() * 0.8;
        launchedClown.vx = seesawMomentum + (downSide * 0.5);
        launchedClown.active = true;

        // Landing clown now waits on the landing side (which becomes the new DOWN side)
        landingClown.active = false;
        landingClown.vy = 0;
        landingClown.vx = 0;

        // Swap roles
        const temp = this.flyingClownIndex;
        this.flyingClownIndex = this.waitingClownIndex;
        this.waitingClownIndex = temp;

        // Tilt seesaw so landing side is now DOWN (waiting clown sits there)
        this.seesaw.setTilt(landingSide);

        audio.playBounce();
    }

    loseLife() {
        this.lives--;
        audio.playDeath();

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Reset - drop a new clown from the top
            this.flyingClown.reset();
            this.flyingClown.active = true;
        }
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
        const clown = this.flyingClown;
        if (!clown.active) return;

        // Only check when clown is falling
        if (clown.vy <= 0) return;

        const clownBounds = clown.getBounds();
        const seesawTop = this.seesaw.y;

        // Check if clown reached seesaw height
        if (clownBounds.bottom >= seesawTop &&
            clownBounds.bottom <= seesawTop + clown.vy + 10) {

            // Check horizontal overlap with seesaw
            if (clownBounds.right >= this.seesaw.x &&
                clownBounds.left <= this.seesaw.x + this.seesaw.width) {

                const clownCenterX = clown.getCenterX();

                // Must land on the UP side to launch the other clown
                if (this.seesaw.isOnUpSide(clownCenterX)) {
                    // Determine which side was hit
                    const landingSide = this.seesaw.getSideHit(clownCenterX);

                    // Launch the waiting clown!
                    this.launchWaitingClown(landingSide);
                }
                // If landed on DOWN side (where waiting clown is), clown falls through
                // This is a miss - clown will fall and lose a life
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

        // Update flying clown
        if (this.flyingClown.active) {
            this.flyingClown.update();
        }

        this.balloons.update();

        // Check seesaw collision
        this.checkSeesawCollision();

        // Check balloon collisions
        if (this.flyingClown.active) {
            const points = this.balloons.checkCollision(this.flyingClown);
            if (points > 0) {
                this.addScore(points);
                audio.playPop();
            }
        }

        // Check if clown fell
        if (this.flyingClown.active && this.flyingClown.hasFallen()) {
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

        // Draw flying clown
        if (this.flyingClown.active) {
            this.flyingClown.render(this.renderer.ctx);
        }

        // Draw waiting clown on the DOWN side of seesaw
        const downSide = this.seesaw.getDownSide();
        const waitingX = downSide === -1 ? this.seesaw.getLeftX() : this.seesaw.getRightX();
        this.waitingClown.x = waitingX - CLOWN_WIDTH / 2;
        this.waitingClown.y = this.seesaw.y - CLOWN_HEIGHT + 4; // Slightly lower on down side
        this.waitingClown.active = true;
        this.waitingClown.render(this.renderer.ctx);
        this.waitingClown.active = false;

        // Draw HUD
        this.renderer.drawHUD(this.score, this.lives, this.level);
    }
}
