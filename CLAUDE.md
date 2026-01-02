# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Circus is a web-based recreation of the classic Atari 2600 game "Circus Atari" (1980). Players control a seesaw to bounce clowns upward to pop rows of balloons.

## Development Commands

```bash
# Start local development server (no build step required)
npx serve .

# Or use Python's built-in server
python -m http.server 8000
```

## Architecture

Vanilla JavaScript (ES6 modules) with HTML5 Canvas. No dependencies or build process.

```
circus/
├── index.html          # Entry point, loads main.js as module
├── css/style.css       # Centered canvas, pixelated rendering, CRT scanlines
├── js/
│   ├── main.js         # Game loop initialization (60fps target)
│   ├── game.js         # State machine (menu/playing/gameover/levelcomplete)
│   ├── config.js       # All constants: dimensions, physics, colors, scoring
│   ├── input.js        # Singleton InputManager (keyboard + mouse)
│   ├── audio.js        # Web Audio API synthesized 8-bit sounds
│   ├── renderer.js     # Canvas drawing, HUD, screen transitions
│   └── entities/
│       ├── seesaw.js   # Player paddle, position clamping, bounce calculation
│       ├── clown.js    # Physics (gravity, velocity), wall/ceiling bounce
│       └── balloon.js  # Grid management, collision detection, pop animations
```

## Key Implementation Details

- **Canvas**: 320x240 internal resolution, scaled 2x with `image-rendering: pixelated`
- **Game Loop**: `requestAnimationFrame` with frame timing for consistent 60fps
- **Physics**: Configurable gravity (0.15), bounce velocity varies by seesaw contact point
- **Audio**: Web Audio API oscillators (square, triangle, sawtooth) - no audio files needed
- **State**: High score persisted to `localStorage` as `circusHighScore`

## Game Mechanics

- Two clowns alternate: active one bounces, other waits on seesaw
- Bounce height increases when landing on seesaw edges vs center
- Three balloon rows: bottom=10pts, middle=20pts, top=30pts
- Bonus life every 5000 points
- Clearing all balloons advances level (no difficulty scaling yet)
