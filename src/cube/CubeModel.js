import * as THREE from 'three';
import { COLOR_HEX } from '../utils/constants.js';

class CubeModel {
  constructor() {
    this.group = new THREE.Group();
    this.cubies = [];
    this.spacing = 1.01; // Spacing multiplier for cubie positions

    // Core dimensions
    this.cubieSize = 0.98;
    this.stickerSize = 0.80;
    this.stickerRadius = 0.15;
    this.stickerOffset = 0.491; // Slightly offset from core center to avoid z-fighting

    this._initMaterials();
    this._buildCube();
  }

  /**
   * Pre-initialize reusable standard materials.
   * @private
   */
  _initMaterials() {
    // Premium matte finish plastic for the core of the cubies
    this.coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x111522,
      roughness: 0.75,
      metalness: 0.15
    });

    // Glossy finish for active stickers
    this.stickerMaterials = {
      W: new THREE.MeshStandardMaterial({ color: COLOR_HEX.white, roughness: 0.15, metalness: 0.05 }),
      Y: new THREE.MeshStandardMaterial({ color: COLOR_HEX.yellow, roughness: 0.15, metalness: 0.05 }),
      R: new THREE.MeshStandardMaterial({ color: COLOR_HEX.red, roughness: 0.15, metalness: 0.05 }),
      O: new THREE.MeshStandardMaterial({ color: COLOR_HEX.orange, roughness: 0.15, metalness: 0.05 }),
      B: new THREE.MeshStandardMaterial({ color: COLOR_HEX.blue, roughness: 0.15, metalness: 0.05 }),
      G: new THREE.MeshStandardMaterial({ color: COLOR_HEX.green, roughness: 0.15, metalness: 0.05 })
    };
  }

  /**
   * Helper to construct a rounded rectangle Shape for the stickers.
   * @private
   */
  _createRoundedRectShape(w, h, r) {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;

    shape.moveTo(x, y + r);
    shape.lineTo(x, y + h - r);
    shape.quadraticCurveTo(x, y + h, x + r, y + h);
    shape.lineTo(x + w - r, y + h);
    shape.quadraticCurveTo(x + w, y + h, x + w, y + h - r);
    shape.lineTo(x + w, y + r);
    shape.quadraticCurveTo(x + w, y, x + w - r, y);
    shape.lineTo(x + r, y);
    shape.quadraticCurveTo(x, y, x, y + r);

    return shape;
  }

  /**
   * Construct 27 cubie groups and place them in 3D grid space.
   * @private
   */
  _buildCube() {
    const stickerGeo = new THREE.ShapeGeometry(
      this._createRoundedRectShape(this.stickerSize, this.stickerSize, this.stickerRadius)
    );
    const coreGeo = new THREE.BoxGeometry(this.cubieSize, this.cubieSize, this.cubieSize);

    // Iterate through coordinates X, Y, Z from -1 to 1
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Avoid geometry for internal core (0,0,0) as it is never visible
          if (x === 0 && y === 0 && z === 0) continue;

          // Create a group for this cubie to group core + stickers together
          const cubie = new THREE.Group();
          cubie.position.set(x * this.spacing, y * this.spacing, z * this.spacing);
          
          // Store logical initial coordinates for identification/tracking
          cubie.userData = { initialPos: { x, y, z } };

          // Add dark plastic core mesh
          const coreMesh = new THREE.Mesh(coreGeo, this.coreMaterial);
          cubie.add(coreMesh);

          // Add outer stickers depending on coordinate boundaries
          
          // Up (+Y) - White (default 'W')
          if (y === 1) {
            const sticker = new THREE.Mesh(stickerGeo, this.stickerMaterials.W);
            sticker.position.set(0, this.stickerOffset, 0);
            sticker.rotation.x = -Math.PI / 2;
            sticker.userData = { isSticker: true };
            cubie.add(sticker);
          }
          // Down (-Y) - Yellow (default 'Y')
          if (y === -1) {
            const sticker = new THREE.Mesh(stickerGeo, this.stickerMaterials.Y);
            sticker.position.set(0, -this.stickerOffset, 0);
            sticker.rotation.x = Math.PI / 2;
            sticker.userData = { isSticker: true };
            cubie.add(sticker);
          }
          // Left (-X) - Orange (default 'O')
          if (x === -1) {
            const sticker = new THREE.Mesh(stickerGeo, this.stickerMaterials.O);
            sticker.position.set(-this.stickerOffset, 0, 0);
            sticker.rotation.y = -Math.PI / 2;
            sticker.userData = { isSticker: true };
            cubie.add(sticker);
          }
          // Right (+X) - Red (default 'R')
          if (x === 1) {
            const sticker = new THREE.Mesh(stickerGeo, this.stickerMaterials.R);
            sticker.position.set(this.stickerOffset, 0, 0);
            sticker.rotation.y = Math.PI / 2;
            sticker.userData = { isSticker: true };
            cubie.add(sticker);
          }
          // Front (+Z) - Green (default 'G')
          if (z === 1) {
            const sticker = new THREE.Mesh(stickerGeo, this.stickerMaterials.G);
            sticker.position.set(0, 0, this.stickerOffset);
            sticker.userData = { isSticker: true };
            cubie.add(sticker);
          }
          // Back (-Z) - Blue (default 'B')
          if (z === -1) {
            const sticker = new THREE.Mesh(stickerGeo, this.stickerMaterials.B);
            sticker.position.set(0, 0, -this.stickerOffset);
            sticker.rotation.y = Math.PI;
            sticker.userData = { isSticker: true };
            cubie.add(sticker);
          }

          this.group.add(cubie);
          this.cubies.push(cubie);
        }
      }
    }
  }

  /**
   * Synchronize the visual 3D cube sticker materials with a logical CubeState object.
   * Uses projection formulas to determine current face + index from world coordinates.
   * @param {CubeState} cubeState - The logical state to read colors from.
   */
  syncFromLogicalState(cubeState) {
    const worldPos = new THREE.Vector3();

    this.cubies.forEach(cubie => {
      cubie.children.forEach(child => {
        // Skip core body, only process sticker meshes
        if (!child.userData.isSticker) return;

        // Extract sticker's current global position
        child.getWorldPosition(worldPos);

        const { face, index } = this._getFaceAndIndexFromWorldPos(worldPos);
        const colorCode = cubeState.faces[face][index];

        const targetMaterial = this.stickerMaterials[colorCode];
        if (targetMaterial) {
          child.material = targetMaterial;
        }
      });
    });
  }

  /**
   * Determine face character (U/D/L/R/F/B) and grid index (0-8) based on world coordinates.
   * @private
   */
  _getFaceAndIndexFromWorldPos(worldPos) {
    const x = Math.round(worldPos.x / this.spacing);
    const y = Math.round(worldPos.y / this.spacing);
    const z = Math.round(worldPos.z / this.spacing);

    const absX = Math.abs(worldPos.x);
    const absY = Math.abs(worldPos.y);
    const absZ = Math.abs(worldPos.z);

    if (absY > absX && absY > absZ) {
      // Y is dominant (U or D face)
      if (worldPos.y > 0) {
        return { face: 'U', index: (z + 1) * 3 + (x + 1) };
      } else {
        return { face: 'D', index: (1 - z) * 3 + (x + 1) };
      }
    } else if (absX > absY && absX > absZ) {
      // X is dominant (L or R face)
      if (worldPos.x > 0) {
        return { face: 'R', index: (1 - y) * 3 + (1 - z) };
      } else {
        return { face: 'L', index: (1 - y) * 3 + (z + 1) };
      }
    } else {
      // Z is dominant (F or B face)
      if (worldPos.z > 0) {
        return { face: 'F', index: (1 - y) * 3 + (x + 1) };
      } else {
        return { face: 'B', index: (1 - y) * 3 + (1 - x) };
      }
    }
  }

  /**
   * Retrieve the base group container.
   */
  getGroup() {
    return this.group;
  }
}

export default CubeModel;
