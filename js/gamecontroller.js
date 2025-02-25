
export class GameController {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.events = {
            forward: false,
            backward: false,
            left: false,
            right: false
        }
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
            }
        });
    }
    executeEvents(deltaTime) {
        const speed = 5; // Movement speed (units per second)
    
        if (this.events.forward) {
            this.player.model.position.z -= speed * deltaTime;
        }
        if (this.events.backward) {
            this.player.model.position.z += speed * deltaTime;
        }
        if (this.events.left) {
            this.player.model.position.x -= speed * deltaTime;
        }
        if (this.events.right) {
            this.player.model.position.x += speed * deltaTime;
        }
    
        // Camera follows the player
        const offset = new THREE.Vector3(0, 2, 3);
        offset.applyQuaternion(this.player.model.quaternion);
        this.game.camera.position.copy(this.player.model.position.clone().add(offset));
        this.game.camera.lookAt(this.player.model.position);
    }
    
    

}