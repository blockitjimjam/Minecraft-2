
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
            this.model.position.y += (this.velocity) * deltaTime ;
            this.velocity -= this.gravity * deltaTime;
        } else {
            this.velocity = 0;
        }
    }
    jump() {
        if (this.touchingGround) {
            this.velocity = 8;
            this.touchingGround = false;
        }
    }
    checkCollisions(terrainBoxes) {
        const playerBox = new THREE.Box3().setFromObject(this.model);
        console.log(terrainBoxes)
        for (const chunkKey in terrainBoxes) { // Loop through all chunk keys
            console.log(chunkKey)
            const chunkBoxes = terrainBoxes[chunkKey]; // Get boxes for the chunk
    
            for (let i = 0; i < chunkBoxes.length; i++) {
                if (playerBox.intersectsBox(new THREE.Box3().setFromObject(chunkBoxes[i]))) {
                    return true; // Collision detected
                }
            }
        }
    
        return false; // No collision
    }
    
}