
export class Player {
    constructor(x, y ,z, color, game, gravity) {
        this.geometry = new THREE.BoxGeometry();
        this.material = new THREE.MeshBasicMaterial({color: color});
        this.model = new THREE.Mesh(this.geometry, this.material);
        this.model.position.set(x, y, z);
        this.gravity = gravity;
        this.velocity = 0;
        this.touchingGround = true;
        game.scene.add(this.model);
    }
    destroy() {
        this.model.geometry.dispose();
        this.model.material.dispose();
        game.scene.remove(this.model);
    }
    tickGravity(deltaTime) {
        if (!this.touchingGround) {
            this.model.position.y += this.velocity * deltaTime;
            this.velocity -= 0.1
        } else {
            this.velocity = 0;
        }
    }
    jump() {
        this.velocity = 5;
        this.touchingGround = false;
    }
}