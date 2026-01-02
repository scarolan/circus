// Game configuration constants

// Canvas dimensions (internal resolution)
export const CANVAS_WIDTH = 320;
export const CANVAS_HEIGHT = 240;
export const SCALE = 2; // Display scale factor

// Colors (Atari 2600 inspired palette)
export const COLORS = {
    background: '#000000',
    seesaw: '#FF6600',
    seesawBase: '#884400',
    clown: '#FFFF00',
    clownAlt: '#FF00FF', // Second clown color
    balloonRow1: '#FF0000', // Bottom row - 10 pts
    balloonRow2: '#00FF00', // Middle row - 20 pts
    balloonRow3: '#0000FF', // Top row - 30 pts
    text: '#FFFFFF',
    textHighlight: '#FFFF00'
};

// Physics
export const GRAVITY = 0.15;
export const BOUNCE_BASE = -8; // Base bounce velocity
export const BOUNCE_EDGE_BONUS = -3; // Extra bounce at seesaw edges
export const MAX_VELOCITY_X = 4;
export const MAX_VELOCITY_Y = 12;

// Seesaw
export const SEESAW_WIDTH = 40;
export const SEESAW_HEIGHT = 8;
export const SEESAW_Y = CANVAS_HEIGHT - 30;
export const SEESAW_SPEED = 4;

// Clown
export const CLOWN_WIDTH = 12;
export const CLOWN_HEIGHT = 16;
export const CLOWN_START_X = CANVAS_WIDTH / 2;
export const CLOWN_START_Y = 50;

// Balloons
export const BALLOON_ROWS = 3;
export const BALLOONS_PER_ROW = 10;
export const BALLOON_WIDTH = 24;
export const BALLOON_HEIGHT = 16;
export const BALLOON_START_Y = 20;
export const BALLOON_SPACING_X = 30;
export const BALLOON_SPACING_Y = 20;
export const BALLOON_POINTS = [10, 20, 30]; // Points per row (bottom to top)

// Game settings
export const STARTING_LIVES = 3;
export const BONUS_LIFE_SCORE = 5000;

// Game states
export const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameover',
    LEVEL_COMPLETE: 'levelcomplete'
};
