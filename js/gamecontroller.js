
export class GameController {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.events = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        }
        this.coordinatesElement = document.getElementById("coordinates");
        const canvas = this.game.renderer.domElement;
        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === canvas) {
                player.model.rotation.y -= event.movementX * 0.005;
            }
        });
    }
    addKeybindsListener() {
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'w':
                    this.events.forward = true;
                    break;
                case 's':
                    this.events.backward = true;
                    break;
                case 'a':
                    this.events.left = true;
                    break;
                case 'd':
                    this.events.right = true;
                    break;
                case ' ':
                    this.events.jump = true;
                    break;
            }
        });
        document.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'w':
                    this.events.forward = false;
                    break;
                case 's':
                    this.events.backward = false;
                    break;
                case 'a':
                    this.events.left = false;
                    break;
                case 'd':
                    this.events.right = false;
                    break;
                case ' ':
                    this.events.jump = false;
                    break;
            }
        });
    }
    executeEvents(deltaTime) {
        const speed = 5; // Movement speed (units per second)
    
        if (this.events.forward) {
            const theta = this.player.model.rotation.y;
            this.player.model.position.x -= Math.sin(theta) * speed * deltaTime;
            this.player.model.position.z -= Math.cos(theta) * speed * deltaTime;

        }
        if (this.events.backward) {
            const theta = this.player.model.rotation.y + Math.PI;
            this.player.model.position.x -= Math.sin(theta) * speed * deltaTime;
            this.player.model.position.z -= Math.cos(theta) * speed * deltaTime;
        }
        if (this.events.left) {
            const theta = this.player.model.rotation.y + Math.PI / 2;
            this.player.model.position.x -= Math.sin(theta) * speed * deltaTime;
            this.player.model.position.z -= Math.cos(theta) * speed * deltaTime;
        }
        if (this.events.right) {
            const theta = this.player.model.rotation.y - Math.PI / 2;
            this.player.model.position.x -= Math.sin(theta) * speed * deltaTime;
            this.player.model.position.z -= Math.cos(theta) * speed * deltaTime;
        }
        if (this.events.jump) {
            this.player.jump();
        }
        this.coordinatesElement.textContent = `x: ${Math.floor(this.player.model.position.x)} y: ${Math.floor(this.player.model.position.y)} z: ${Math.floor(this.player.model.position.z)}`
        this.player.tickGravity(deltaTime)
        // Camera follows the player
        const offset = new THREE.Vector3(0, 2, 3);
        // const offset = new THREE.Vector3(0, 0, 0.1);
        offset.applyQuaternion(this.player.model.quaternion);
        this.game.camera.position.copy(this.player.model.position.clone().add(offset));
        this.game.camera.lookAt(this.player.model.position);
    }
    
    

}