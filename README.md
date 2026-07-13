# Cubix

Solve the cube. See every move.

Cubix is a modern, interactive, browser-based 3×3 Rubik's Cube solver and practice platform built using Vanilla JavaScript, Three.js, and cubejs.

Users can scan a physical Rubik's Cube using their device camera or manually recreate their cube using an interactive 2D cube net. Cubix validates the cube configuration, generates a solution, and visually demonstrates every rotation using an animated 3D Rubik's Cube.

The project combines computer vision-inspired color sampling, cube-state validation, algorithmic solving, Three.js rendering, interactive animations, and browser-based persistence in a minimal Apple-inspired interface.

Cubix is designed to make Rubik's Cube solving visual, understandable, and interactive.

---

## Table of Contents

- [Overview](#overview)
- [Project Vision](#project-vision)
- [Core Features](#core-features)
- [User Flow](#user-flow)
- [Application Pages](#application-pages)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [3D Cube Engine](#3d-cube-engine)
- [Cube State Representation](#cube-state-representation)
- [Manual Cube Input](#manual-cube-input)
- [Camera Cube Scanner](#camera-cube-scanner)
- [Color Detection System](#color-detection-system)
- [Cube Validation](#cube-validation)
- [Solver Engine](#solver-engine)
- [Rubik's Cube Notation](#rubiks-cube-notation)
- [Solution Player](#solution-player)
- [Practice Mode](#practice-mode)
- [Solve History](#solve-history)
- [Local Storage Architecture](#local-storage-architecture)
- [Design System](#design-system)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)
- [Installation](#installation)
- [Development](#development)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [Development Roadmap](#development-roadmap)
- [Future Scope](#future-scope)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Solving a Rubik's Cube usually requires learning algorithms, understanding cube notation, and mentally translating instructions such as `R U R' U'` into physical movements. For beginners, this creates a significant learning barrier.

Cubix removes that barrier. A user can recreate their cube digitally in two ways:
1. Scan each cube face using a device camera.
2. Manually enter sticker colors using a 2D cube net.

Cubix then:
- Reads the cube configuration.
- Normalizes the cube state.
- Validates the configuration.
- Detects impossible cube states.
- Converts the cube into solver notation.
- Generates a solution.
- Displays the complete move sequence.
- Animates every rotation on a 3D cube.
- Provides human-readable instructions.
- Stores the solve locally for future replay.

The application also includes a dedicated practice environment with random scrambles, inspection time, solve timing, and personal statistics.

---

## Project Vision

The goal of Cubix is not simply to output a sequence of Rubik's Cube moves. The goal is to create a visual cube-solving experience.

Traditional cube solvers commonly display instructions such as:
`R U R' U' F2 L D2`

A beginner may not understand what these instructions mean. Cubix translates these instructions into interactive visual movements.
For example, `R` becomes:
> *Rotate the Right Face Clockwise*

The corresponding layer of the 3D cube rotates by 90 degrees. Cubix therefore acts as both a Rubik's Cube solver and a visual learning platform.

---

## Core Features

### Interactive 3D Rubik's Cube
Cubix renders a complete 3×3 Rubik's Cube using Three.js. Users can:
- Rotate the camera around the cube.
- Zoom the camera.
- Inspect all cube faces.
- Watch individual layer rotations.
- Replay complete solutions.
- Adjust animation speed.
- Manually rotate cube layers.
- Apply generated scrambles.

The cube performs subtle random rotations on the landing page to create a dynamic visual experience.

### Camera Cube Scanner
Users can scan a physical Rubik's Cube directly from their browser. The scanning system:
- Requests camera access.
- Uses the rear camera on supported mobile devices.
- Displays a 3×3 alignment grid.
- Guides the user through six cube faces.
- Samples sticker colors.
- Classifies detected colors.
- Displays a color preview.
- Allows manual correction.
- Stores confirmed face data.

**Scanning order:**
`Front` ➔ `Right` ➔ `Back` ➔ `Left` ➔ `Up` ➔ `Down`

Progress is displayed during scanning. Example:
> **Face 2 of 6**
>
> **RIGHT FACE**
>
> Align the cube inside the grid.

### Manual Cube Input
Users who do not want to use their camera can manually recreate their cube. Cubix displays an unfolded cube net.

```
                 ┌───────────┐
                 │    UP     │
                 └───────────┘

┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│   LEFT    │ │   FRONT   │ │   RIGHT   │ │   BACK    │
└───────────┘ └───────────┘ └───────────┘ └───────────┘

                 ┌───────────┐
                 │   DOWN    │
                 └───────────┘
```

Each face contains nine selectable stickers. The user selects a color and clicks a sticker.
Supported colors:
- White
- Yellow
- Red
- Orange
- Blue
- Green

Center stickers are automatically locked because center pieces determine the identity of each face.

The manual editor includes:
- Color palette.
- Cube net.
- Color counter.
- Validation status.
- Load Solved Cube.
- Clear Cube.
- Continue to Solver.

Incomplete cube input is automatically saved in `localStorage`. Refreshing the browser does not remove the user's progress.

### Cube State Validation
Before solving, Cubix validates the complete cube state.
Basic validation checks include:
- Exactly 54 stickers.
- Six center stickers.
- Exactly six cube colors.
- Nine stickers of each color.
- Valid center configuration.

Example validation message:
> **Red has 10 stickers.**
>
> A valid 3×3 cube requires exactly 9 red stickers.

Cubix avoids displaying generic errors like `Invalid Cube`. Whenever possible, the application explains the actual problem.

### Physical Cube Validation
A cube may contain the correct number of colors while still representing an impossible physical configuration. Examples include:
- A single flipped edge.
- A single twisted corner.
- Two swapped edge pieces.
- Invalid corner orientation.
- Invalid edge orientation.
- Invalid permutation parity.

Cubix validates cubie orientation and permutation before sending the state to the solver.
Example:
> **This cube configuration cannot exist on a physical 3×3 Rubik's Cube.**
>
> A single edge appears to be flipped.

This prevents invalid states from reaching the solving engine.

### Solver Engine
Cubix uses `cubejs` as its primary cube-solving engine.
The solving pipeline is:
`Cube Input` ➔ `State Normalization` ➔ `Color Mapping` ➔ `Cube Validation` ➔ `Solver State Generation` ➔ `cubejs` ➔ `Solution Notation` ➔ `Move Parser` ➔ `Three.js Animation Queue`

The solving engine generates standard cube notation. Example:
`R U R' U' F2 L D2 B R2`

Cubix parses each move and converts it into an animation command.

---

## User Flow

```
  Open Cubix
      │
      ▼
┌─────────── Choose Input Method ───────────┐
│                                           │
▼                                           ▼
Scan Cube                               Manual Input
│                                           │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
               Create Cube State
                      │
                      ▼
               Validate Colors
                      │
                      ▼
           Validate Physical State
                      │
                      ▼
            Generate Solver State
                      │
                      ▼
                 Solve Cube
                      │
                      ▼
               Display Solution
                      │
                      ▼
                Animate Moves
                      │
                      ▼
              Save Solve History
                      │
                      ▼
                Replay Anytime
```

---

## Application Pages

Cubix is designed as a multi-page frontend application. The primary pages are:

- **Home**: Introduces Cubix. The hero section contains a large interactive Three.js cube rotating slowly. Actions: *Solve a Cube* & *Try a Scramble*.
- **Solver**: The main Cubix workspace.
  - *Left sidebar*: Solution status, move count, estimated duration, move list, human-readable instructions, playback controls, animation speed, and settings.
  - *Right area*: Interactive 3D cube.
- **Scanner**: Manages camera-based cube input through a guided workflow (Permission request, face alignment, color detection, correction, etc.).
- **Manual Input**: Displays the complete unfolded cube net, color palette, color statistics, and validation status.
- **Practice**: Practice Mode allows users to improve speed using scrambles, a 15-second inspection timer, and a solve timer.
- **History**: Displays previous solves from `localStorage` with detailed stats and replays.
- **About**: Explains the technical aspects, Rubik's Cube state representation, notation, and technologies used.

---

## Technology Stack

- **HTML5**: Semantic application structure, video elements for camera stream, and canvas elements.
- **CSS3**: Powers the design system (CSS Custom Properties, Grid, Flexbox, glass effects, transitions, micro-interactions, responsive design). *No CSS framework is used.*
- **JavaScript (ES6 Modules)**: Vanilla JavaScript logic. *React is intentionally not used* to retain direct control over Three.js rendering and architecture.
- **Three.js**: WebGL rendering of the 3D Rubik's Cube (scene, lighting, camera controls, rotation animations, raycasting).
- **cubejs**: Rubik's Cube state manipulation, scrambling, and solving.
- **Boxicons**: Minimal interface icons.
- **Vite**: Modern development environment and build tool.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                       │
│                                                         │
│ Home │ Scanner │ Manual │ Solver │ Practice │ History   │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 APPLICATION CORE                        │
│                                                         │
│ State Manager │ Event Bus │ Router │ App Controller     │
└──────────────────────────┬──────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ INPUT SYSTEM    │ │ CUBE ENGINE  │ │ STORAGE SYSTEM   │
│                 │ │              │ │                  │
│ Camera Scanner  │ │ Cube State   │ │ Solve History    │
│ Manual Input    │ │ Validation   │ │ Practice Stats   │
│ Color Detection │ │ Move Parser  │ │ User Settings    │
└────────┬────────┘ └──────┬───────┘ └──────────────────┘
         │                 │
         └────────┬────────┘
                  ▼
        ┌───────────────────┐
        │   SOLVER ENGINE   │
        │                   │
        │      cubejs       │
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │ THREE.JS ENGINE   │
        │                   │
        │ Renderer          │
        │ Cube Model        │
        │ Rotation Engine   │
        │ Animation Queue   │
        └───────────────────┘
```

---

## Project Structure

```
cubix/
│
├── public/
│   ├── favicon.svg
│   ├── icons/
│   └── assets/
│
├── src/
│   │
│   ├── core/
│   │   ├── App.js
│   │   ├── Router.js
│   │   ├── StateManager.js
│   │   └── EventBus.js
│   │
│   ├── cube/
│   │   ├── CubeScene.js
│   │   ├── CubeModel.js
│   │   ├── CubeState.js
│   │   ├── CubeController.js
│   │   ├── RotationEngine.js
│   │   ├── AnimationQueue.js
│   │   └── CubeValidator.js
│   │
│   ├── solver/
│   │   ├── Solver.js
│   │   ├── CubeStateConverter.js
│   │   ├── MoveParser.js
│   │   ├── MoveTranslator.js
│   │   └── SolutionManager.js
│   │
│   ├── scanner/
│   │   ├── CameraManager.js
│   │   ├── FrameProcessor.js
│   │   ├── GridSampler.js
│   │   ├── ColorDetector.js
│   │   ├── ColorClassifier.js
│   │   └── ScanSession.js
│   │
│   ├── manual/
│   │   ├── CubeNet.js
│   │   ├── ColorPalette.js
│   │   └── ManualInputController.js
│   │
│   ├── practice/
│   │   ├── ScrambleGenerator.js
│   │   ├── SolveTimer.js
│   │   ├── InspectionTimer.js
│   │   └── StatisticsManager.js
│   │
│   ├── storage/
│   │   ├── StorageManager.js
│   │   ├── SolveHistory.js
│   │   ├── PracticeStorage.js
│   │   └── SettingsStorage.js
│   │
│   ├── ui/
│   │   ├── ThemeManager.js
│   │   ├── Modal.js
│   │   ├── Toast.js
│   │   ├── Controls.js
│   │   └── Navigation.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── colors.js
│   │   ├── math.js
│   │   └── helpers.js
│   │
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── SolverPage.js
│   │   ├── ScannerPage.js
│   │   ├── ManualPage.js
│   │   ├── PracticePage.js
│   │   ├── HistoryPage.js
│   │   └── AboutPage.js
│   │
│   ├── styles/
│   │   ├── variables.css
│   │   ├── reset.css
│   │   ├── typography.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   ├── animations.css
│   │   └── responsive.css
│   │
│   └── main.js
│
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── LICENSE
└── .gitignore
```

---

## 3D Cube Engine

The Three.js cube is constructed from 27 cube positions. Each cubie is represented as an individual Three.js mesh or group.

Conceptual coordinates:
`X = -1, 0, 1`
`Y = -1, 0, 1`
`Z = -1, 0, 1`

The visual cube contains:
- 8 corner cubies
- 12 edge cubies
- 6 center cubies
- 1 internal core position (no visible geometry)

### Layer Rotation
A move such as `R` requires all cubies on the right layer (`X = 1`) to rotate. The rotation engine:
1. Selects the cubies belonging to the target layer.
2. Creates a temporary Three.js group.
3. Attaches the selected cubies to this group.
4. Animates the rotation of the group toward 90 degrees.
5. Updates the logical coordinates and orientation of each affected cubie.
6. Detaches the cubies from the temporary group.
7. Disposes of the temporary group.

---

## Cube State Representation

Cubix maintains a logical cube state separate from the visual Three.js scene. **The Three.js scene should never be treated as the primary source of cube data.**

```
Logical Cube State ➔ Cube Controller ➔ Three.js Representation
```

A conceptual face state mapping:
```json
{
  "U": ["W", "W", "W", "W", "W", "W", "W", "W", "W"],
  "R": ["R", "R", "R", "R", "R", "R", "R", "R", "R"],
  "F": ["G", "G", "G", "G", "G", "G", "G", "G", "G"],
  "D": ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"],
  "L": ["O", "O", "O", "O", "O", "O", "O", "O", "O"],
  "B": ["B", "B", "B", "B", "B", "B", "B", "B", "B"]
}
```
A single canonical face-order convention is defined in `constants.js` to ensure sync across all modules.

---

## Manual Cube Input

The manual editor uses a 54-sticker cube state draft. Center pieces are locked as they identify the faces.
When a sticker color is modified:
```
User Selects Color ➔ Clicks Net Sticker ➔ ManualInputController Updates State ➔ Update Color Counter & Validate ➔ Save Draft
```

Color counts are updated in real time:
- White: `9 / 9`
- Yellow: `9 / 9`
- Red: `10 / 9` (Shows warning)

The final **Solve** button is disabled until color counts and structure pass validation.

---

## Camera Cube Scanner

Uses the browser MediaDevices API:
```javascript
navigator.mediaDevices.getUserMedia({
  video: { facingMode: { ideal: "environment" } }
})
```

The video stream is sampled using a canvas.

### Scanning Grid
The overlay has nine sampling areas:
```
┌─────────┬─────────┬─────────┐
│    1    │    2    │    3    │
├─────────┼─────────┼─────────┤
│    4    │    5    │    6    │
├─────────┼─────────┼─────────┤
│    7    │    8    │    9    │
└─────────┴─────────┴─────────┘
```
For each cell, Cubix samples multiple pixels near the center, ignores dark/overexposed pixels, averages the RGB, and normalizes it to classify the color.

---

## Color Detection System

Raw RGB is highly sensitive to lighting. Cubix converts RGB values to HSL or CIELAB (CIELAB is preferred to calculate perceptual color distances from standard cube references).

```
Sampled Color ➔ Convert RGB to LAB ➔ Compare References ➔ Calculate Distance ➔ Select Closest Color
```

Predefined reference values can be calibrated dynamically in future releases using the center stickers.

### Scanner Correction
Detection is not assumed to be perfect. After scanning, the user sees a preview grid:
```
┌─────┬─────┬─────┐
│  G  │  G  │  W  │
├─────┼─────┼─────┤
│  G  │  G  │  G  │
├─────┼─────┼─────┤
│  O  │  G  │  G  │
└─────┴─────┴─────┘
[ Edit Colors ]    [ Confirm Face ]
```
Users can tap any sticker to manually cycle/override colors.

---

## Cube Validation

Validation happens in multiple stages:
1. **Stage 1 (Structure)**: 6 faces, 9 stickers per face, 54 total.
2. **Stage 2 (Color)**: 6 unique colors, 9 stickers of each color.
3. **Stage 3 (Centers)**: Faces have expected center stickers.
4. **Stage 4 (Cubies)**: Corners/Edges are validated (e.g. no duplicate pieces).
5. **Stage 5 (Orientation)**: Edges and corners are checked for valid physical twists.
6. **Stage 6 (Permutation)**: Permutation parity is validated.

---

## Solver Engine

The solver acts as a wrapper around the `cubejs` library:
```
Input State ➔ Normalization ➔ Color Mapping ➔ Validation ➔ Solver State ➔ cubejs ➔ Parse Notation ➔ Animation Queue
```

### Rubik's Cube Notation
Standard Kociemba/Singmaster notation is used:
- **Faces**: `U` (Up), `D` (Down), `L` (Left), `R` (Right), `F` (Front), `B` (Back).
- **Modifiers**:
  - `R` - Rotate Right Face 90° Clockwise.
  - `R'` - Rotate Right Face 90° Counterclockwise.
  - `R2` - Rotate Right Face 180° Double-rotation.

### Move Translator
Translates standard moves to human-readable strings, e.g., `R` becomes "*Rotate the right face clockwise*".

---

## Solution Player

Controls the animation of the solution:
- **Controls**: Previous, Play, Pause, Next, Restart, Solve All.
- **Speed**: Adjustable animation playback speeds.
- **Highlight**: The active move is highlighted in the move list (e.g. `R U [R'] U' F2 L`).
- **Rotation Indicators**: Visually assists the user on the 3D model with subtle direction arrows.

---

## Practice Mode

- **Scramble Generator**: Generates random scramble sequences (e.g. `R U2 F' L D2 B R2 U' F2 D`).
- **Inspection**: Optional 15-second inspection countdown timer.
- **Solve Timer**: Measures the solve time (Ready, Running, Stopped, Saved).
- **Stats**: Local persistence of Best Time, Average Time, Total Solves.

---

## Local Storage Architecture

All persistence is managed by a centralized `StorageManager`:
- `cubix.settings`: Themes, speeds, and educational toggles.
- `cubix.manualDraft`: Interrupted manual input states.
- `cubix.scanSession`: Active scan session cache.
- `cubix.solveHistory`: Historical solve logs.
- `cubix.practiceHistory`: Practice solve times.
- `cubix.practiceStats`: Compiled user stats.

---

## Design System

- **Philosophy**: Neutral UI with Rubik's cube colors restricted to active elements. Apple-inspired layouts (calm, spatial, focused).
- **Themes**:
  - *Dark*: Near-black soft charcoal surfaces, off-white text, subtle gray borders.
  - *Light*: Warm off-white backgrounds, soft white surfaces, near-black text.
- **Typography**: Confident, medium/semibold headings, tight spacing.
- **Glassmorphism**: Glass overlays and backdrop blurs used selectively on floating bars and modals.

---

## Known Limitations

- **Lighting**: Sensitive to warm/colored light sources.
- **Stickers**: Custom colors, custom reflective or faded stickers may degrade CV accuracy.
- **Orientation**: Users must follow the guided sequence carefully.
- **Persistence**: Clearing browser data deletes solve history and settings.

---

## Development Roadmap

- [ ] **Phase 1**: Foundation (Vite setup, styling, router, theme).
- [ ] **Phase 2**: Three.js Cube (3D mesh assembly, materials, controls).
- [ ] **Phase 3**: Rotation Engine (Move rotations, queue).
- [ ] **Phase 4**: Cube State (Logical model sync).
- [ ] **Phase 5**: Solver (cubejs integration, parser).
- [ ] **Phase 6**: Solution Player (UI controls, speed settings).
- [ ] **Phase 7**: Manual Input (2D Net palette, draft caching).
- [ ] **Phase 8**: Validation (Color limits, orientation/permutation checks).
- [ ] **Phase 9**: Scanner (Camera stream capture, CIELAB classification, preview correction).
- [ ] **Phase 10**: Practice Mode (Scramble generator, solve timer).
- [ ] **Phase 11**: History (Solve logging, replays, management).
- [ ] **Phase 12**: Polish (A11y, mobile responsive drawer, performance).

---

## Contributing

1. Fork the repo and create your feature branch: `git checkout -b feature/feature-name`
2. Commit changes using prefix guidelines (e.g. `feat:`, `fix:`, `docs:`, `refactor:`, `style:`, `perf:`).
3. Open a Pull Request.

---

## License

This project is licensed under the MIT License.
