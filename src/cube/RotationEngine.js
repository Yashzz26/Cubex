import * as THREE from 'three';

// Easing function for smooth premium animation feel
const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Define moves: axis of rotation, coordinate check function, and base clockwise angle
const MOVE_DEFS = {
  'R': { axis: 'x', check: (pos) => pos.x > 0.5,  baseAngle: -Math.PI / 2 },
  'L': { axis: 'x', check: (pos) => pos.x < -0.5, baseAngle: Math.PI / 2 },
  'U': { axis: 'y', check: (pos) => pos.y > 0.5,  baseAngle: -Math.PI / 2 },
  'D': { axis: 'y', check: (pos) => pos.y < -0.5, baseAngle: Math.PI / 2 },
  'F': { axis: 'z', check: (pos) => pos.z > 0.5,  baseAngle: -Math.PI / 2 },
  'B': { axis: 'z', check: (pos) => pos.z < -0.5, baseAngle: Math.PI / 2 }
};

class RotationEngine {
  /**
   * Initializes the rotation engine for a specific cube model.
   * @param {CubeModel} cubeModel - The model containing the 27 cubies.
   * @param {CubeScene} cubeScene - The active Three.js rendering scene.
   */
  constructor(cubeModel, cubeScene) {
    this.cubeModel = cubeModel;
    this.cubeScene = cubeScene;
    this.isAnimating = false;
    this.defaultDuration = 350; // Milliseconds per 90-degree turn
  }

  /**
   * Performs an animated rotation on a specific layer.
   * @param {string} move - Standard notation move (e.g. "R", "U'", "F2").
   * @param {Function} onComplete - Callback executed when the animation finishes.
   * @param {number} speedMultiplier - Speed scaling factor.
   */
  rotateLayer(move, onComplete, speedMultiplier = 1) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // Parse the move notation
    const baseMove = move[0];
    const modifier = move.slice(1);

    const moveDef = MOVE_DEFS[baseMove];
    if (!moveDef) {
      console.error(`Invalid move notation received: ${move}`);
      this.isAnimating = false;
      if (onComplete) onComplete();
      return;
    }

    const { axis, check, baseAngle } = moveDef;
    
    // Calculate exact target angle based on modifiers
    let targetAngle = baseAngle;
    let duration = this.defaultDuration / speedMultiplier;

    if (modifier.includes("'")) {
      targetAngle = -baseAngle;
    } else if (modifier.includes('2')) {
      targetAngle = baseAngle * 2;
      duration = duration * 1.4; // Double turns take slightly longer but not double
    }

    // 1. Gather cubies in the target layer
    const modelGroup = this.cubeModel.getGroup();
    const activeCubies = this.cubeModel.cubies.filter(cubie => check(cubie.position));

    if (activeCubies.length === 0) {
      console.warn(`No cubies found on the layer for move: ${move}`);
      this.isAnimating = false;
      if (onComplete) onComplete();
      return;
    }

    // 2. Create temporary rotation group
    const tempGroup = new THREE.Group();
    modelGroup.add(tempGroup);

    // 3. Attach cubies preserving their world transforms
    activeCubies.forEach(cubie => {
      tempGroup.attach(cubie);
    });

    // 4. Configure animation timing variables
    const startTime = performance.now();
    
    // 5. Register animation callback in the rendering scene
    const updateCallback = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);
      
      const currentAngle = easedProgress * targetAngle;

      // Apply rotation on target axis
      if (axis === 'x') tempGroup.rotation.x = currentAngle;
      if (axis === 'y') tempGroup.rotation.y = currentAngle;
      if (axis === 'z') tempGroup.rotation.z = currentAngle;

      if (progress >= 1) {
        // Remove callback first to prevent double firing
        const idx = this.cubeScene.onUpdateCallbacks.indexOf(updateCallback);
        if (idx !== -1) {
          this.cubeScene.onUpdateCallbacks.splice(idx, 1);
        }

        // Snap to exact target rotation to clean visual alignment
        if (axis === 'x') tempGroup.rotation.x = targetAngle;
        if (axis === 'y') tempGroup.rotation.y = targetAngle;
        if (axis === 'z') tempGroup.rotation.z = targetAngle;
        tempGroup.updateMatrixWorld();

        // 6. Detach cubies and perform coordinate snapping
        const spacing = this.cubeModel.spacing;
        
        // Use a copied array because we mutate attachments inside loop
        const cubiesToDetach = [...tempGroup.children];
        cubiesToDetach.forEach(cubie => {
          modelGroup.attach(cubie);

          // Position coordinate snapping
          cubie.position.x = Math.round(cubie.position.x / spacing) * spacing;
          cubie.position.y = Math.round(cubie.position.y / spacing) * spacing;
          cubie.position.z = Math.round(cubie.position.z / spacing) * spacing;

          // Rotation matrix snapping (prevents accumulated floating point errors)
          cubie.updateMatrixWorld();
          const rotMatrix = new THREE.Matrix4();
          rotMatrix.extractRotation(cubie.matrix);
          
          const elements = rotMatrix.elements;
          for (let i = 0; i < elements.length; i++) {
            // Skip translation column and scale-check boundaries
            if (i === 3 || i === 7 || i === 11 || i >= 12) continue;
            elements[i] = Math.round(elements[i]);
          }

          cubie.quaternion.setFromRotationMatrix(rotMatrix);
          cubie.updateMatrix();
        });

        // 7. Cleanup temp group
        modelGroup.remove(tempGroup);
        
        this.isAnimating = false;
        if (onComplete) onComplete();
      }
    };

    this.cubeScene.registerUpdate(updateCallback);
  }
}

export default RotationEngine;
