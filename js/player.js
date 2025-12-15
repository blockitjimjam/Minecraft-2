export class Player {
    constructor(x, y ,z, color, game, gravity) {
        this.geometry = new THREE.BoxGeometry(1, 2);
        this.material = new THREE.MeshStandardMaterial({color: color});
        this.model = new THREE.Mesh(this.geometry, this.material);
        this.model.position.set(x, y, z);
        this.gravity = gravity;
        this.velocity = 0;
        this.touchingGround = false;
        game.scene.add(this.model);
    }
    destroy() {
        this.model.geometry.dispose();
        this.model.material.dispose();
        game.scene.remove(this.model);
    }
    hide() {
        this.model.visible = false;
    }
    show() {
        this.model.visible = true;
    }
    tickGravity(deltaTime) {
        if (!this.touchingGround) {
            this.model.position.y += (this.velocity) * deltaTime;
            this.velocity -= this.gravity * deltaTime;
        } else {
            this.velocity = 0;
        }
    }
    jump() {
        if (this.touchingGround) {
            this.velocity = 15;
            this.touchingGround = false;
        }
    }
    updateColor(color) {
        this.material.color.setHex(color);
    }
    async checkCollisions(terrainBoxes) {
        const playerBox = new THREE.Box3().setFromObject(this.model);
        let landedOnGround = false; // Track if the player landed on top of something
        
        for (const boxx of Object.values(terrainBoxes)) {
            boxx.forEach(box => {
                if (playerBox.intersectsBox(box)) {  
                    if (!(boxx.userData?.type === "boost")) {
                        const boxMin = box.min;
                        const boxMax = box.max;
                        const playerMin = playerBox.min;
                        const playerMax = playerBox.max;
        
                        // Calculate overlap on each axis
                        const overlapX = Math.min(playerMax.x - boxMin.x, boxMax.x - playerMin.x);
                        const overlapY = Math.min(playerMax.y - boxMin.y, boxMax.y - playerMin.y);
                        const overlapZ = Math.min(playerMax.z - boxMin.z, boxMax.z - playerMin.z);

                        // Calculate direction of collision for each axis
                        const directionX = this.model.position.x < (boxMin.x + boxMax.x) / 2 ? -1 : 1;
                        const directionZ = this.model.position.z < (boxMin.z + boxMax.z) / 2 ? -1 : 1;

                        // Find smallest positive overlap
                        let minOverlap = Math.min(overlapX, Math.min(overlapY, overlapZ));

                        if (minOverlap === overlapX) {
                            // X-axis collision
                            this.model.position.x += overlapX * directionX;
                        } else if (minOverlap === overlapY) {
                            // Y-axis collision
                            const playerHalfHeight = (playerMax.y - playerMin.y) / 2;
                            
                            if (this.velocity < 0) {  // Falling
                                if (this.model.position.y - playerHalfHeight < box.max.y) {
                                    this.model.position.y = box.max.y + playerHalfHeight;
                                    this.velocity = 0;
                                    this.touchingGround = true;
                                    landedOnGround = true;
                                }
                            } else if (this.velocity > 0) {  // Rising
                                if (this.model.position.y + playerHalfHeight > box.min.y) {
                                    this.model.position.y = box.min.y - playerHalfHeight;
                                    this.velocity = Math.max(-1, -this.velocity * 0.5);
                                }
                            }
                        } else {
                            // Z-axis collision
                            this.model.position.z += overlapZ * directionZ;
                        }
                    } else {
                        this.velocity = boxx.userData?.power;
                    }
                }
                });
                
            }
        
            return landedOnGround; // Return true ONLY if the player actually lands on top
    }
    
    
    
    
}