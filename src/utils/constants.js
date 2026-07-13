/**
 * Cubix Application Constants
 */

// Cube Faces
export const FACES = {
  UP: 'U',
  DOWN: 'D',
  LEFT: 'L',
  RIGHT: 'R',
  FRONT: 'F',
  BACK: 'B'
};

// Face order convention for scanner and state converter
// Scanning Order: Front, Right, Back, Left, Up, Down
export const SCAN_ORDER = [
  FACES.FRONT,
  FACES.RIGHT,
  FACES.BACK,
  FACES.LEFT,
  FACES.UP,
  FACES.DOWN
];

// Color mapping definitions
export const COLORS = {
  W: 'white',
  Y: 'yellow',
  R: 'red',
  O: 'orange',
  B: 'blue',
  G: 'green'
};

// Color hex codes for stickers
export const COLOR_HEX = {
  white: '#ffffff',
  yellow: '#ffcc00',
  red: '#ff3b30',
  orange: '#ff9500',
  blue: '#007aff',
  green: '#34c759'
};

// Default Solved Cube State representation
// Each face has 9 stickers of its respective default color
export const DEFAULT_SOLVED_STATE = {
  [FACES.UP]: Array(9).fill('W'),
  [FACES.DOWN]: Array(9).fill('Y'),
  [FACES.FRONT]: Array(9).fill('G'),
  [FACES.BACK]: Array(9).fill('B'),
  [FACES.LEFT]: Array(9).fill('O'),
  [FACES.RIGHT]: Array(9).fill('R')
};

// Center sticker indices for a 3x3 net face (0-indexed center is 4)
export const CENTER_STICKER_INDEX = 4;

// Default settings
export const DEFAULT_SETTINGS = {
  theme: 'dark',
  animationSpeed: 1,
  educationalMode: true,
  rotationIndicators: true,
  solutionView: 'sequence'
};
