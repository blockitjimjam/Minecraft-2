import * as THREE from 'https://unpkg.com/three@latest/build/three.module.js';
export class Player {
    constructor(x, y ,z, color, game) {
        this.geometry = new THREE.BoxGeometry();
        this.material = new THREE.MeshBasicMaterial({color: color});
        this.model = new THREE.Mesh(this.geometry, this.material);
        this.model.position.set(x, y, z);
        game.scene.add(this.model);
    }
}