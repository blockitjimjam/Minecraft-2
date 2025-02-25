
export class Player {
    constructor(x, y ,z, color, game) {
        this.geometry = new THREE.BoxGeometry();
        this.material = new THREE.MeshBasicMaterial({color: color});
        this.model = new THREE.Mesh(this.geometry, this.material);
        this.model.position.set(x, y, z);
        game.scene.add(this.model);
    }
    destroy() {
        this.model.geometry.dispose();
        this.model.material.dispose();
        game.scene.remove(this.model);
    }
}