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
      white: new THREE.MeshStandardMaterial({ color: COLOR_HEX.white, roughness: 0.1, metalness: 0.05 }),
      yellow: new THREE.MeshStandardMaterial({ color: COLOR_HEX.yellow, roughness: 0.1, metalness: 0.05 }),
      red: new THREE.MeshStandardMaterial({ color: COLOR_HEX.red, roughness: 0.1, metalness: 0.05 }),
      orange: new THREE.MeshStandardMaterial({ color: COLOR_HEX.orange, roughness: 0.1, metalness: 0.05 }),
      blue: new THREE.MeshStandardMaterial({ color: COLOR_HEX.blue, roughness: 0.1, metalness: 0.05 }),
      green: new THREE.MeshStandardMaterial({ color: COLOR_HEX.green, roughness: 0.1, metalness: 0.05 })
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
          
          // Up (+Y) - White
          if (y === 1) {
            const sticker = new THREE.Mesh(stickerGeo, this.stickerMaterials.white);
            sticker.position.set(0, this.stickerOffset, 0);
            sticker.rotation.x = -Math.PI / 2;
            cubie.add(sticker);
          }
          // Down (-Y) - Yellow
          if (y === -1) {
            const sticker = new THREE.Mesh(stickerGeo, this.stickerMaterials.yellow);
            sticker.position.set(0, -this.stickerOffset, 0);
            sticker.rotation.x = Math.PI / 2;
            cubie.add(sticker);
          }
          // Left (-X) - Orange
          if (x === -1) {
            const sticker = new THREE.Mesh(stickerGeo, this.stickerMaterials.orange);
            sticker.position.set(-this.stickerOffset, 0, 0);
            sticker.rotation.y = -Math.PI / 2;
            cubie.add(sticker);
          }
          // Right (+X) - Red
          if (x === 1) {
            const sticker = new THREE.Mesh(stickerGeo, this.stickerMaterials.red);
            sticker.position.set(this.stickerOffset, 0, 0);
            sticker.rotation.y = Math.PI / 2;
            cubie.add(sticker);
          }
          // Front (+Z) - Green
          if (z === 1) {
            const sticker = new THREE.Mesh(stickerGeo, this.stickerMaterials.green);
            sticker.position.set(0, 0, this.stickerOffset);
            cubie.add(sticker);
          }
          // Back (-Z) - Blue
          if (z === -1) {
            const sticker = new THREE.Mesh(stickerGeo, this.stickerMaterials.blue);
            sticker.position.set(0, 0, -this.stickerOffset);
            sticker.rotation.y = Math.PI;
            cubie.add(sticker);
          }

          this.group.add(cubie);
          this.cubies.push(cubie);
        }
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
