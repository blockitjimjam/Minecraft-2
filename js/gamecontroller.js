
export class GameController {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.events = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            leftClick: false,
            rightClick: false
        }
        this.controlsSuspended = false;
        this.pitch = 0;
        this.speed = 4;
        this.coordinatesElement = document.getElementById("coordinates");
        const canvas = this.game.renderer.domElement;
        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === canvas) {
                player.model.rotation.y -= event.movementX * 0.005;
                this.pitch -= event.movementY * 0.005;
                this.pitch = Math.max(-3, Math.min(this.pitch, 3));
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
        // detect rightclick and left click for breaking and placing blocks
        document.addEventListener('mousedown', (event) => {
            if (event.button === 0) {
                this.events.leftClick = true;
            } else if (event.button === 2) {
                this.events.rightClick = true;
            }
        });
        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                this.events.leftClick = false;
            } else if (event.button === 2) {
                this.events.rightClick = false;
            }
        });
    }
    executeEvents(deltaTime, playerPlaceBlock, playerDestroyBlock) {
        if (this.controlsSuspended) {
            // set all events to false
            for (const key in this.events) {
                this.events[key] = false;
            }
        }
    
        if (this.events.forward) {
            const theta = this.player.model.rotation.y;
            this.player.model.position.x -= Math.sin(theta) * this.speed * deltaTime;
            this.player.model.position.z -= Math.cos(theta) * this.speed * deltaTime;

        }
        if (this.events.backward) {
            const theta = this.player.model.rotation.y + Math.PI;
            this.player.model.position.x -= Math.sin(theta) * this.speed * deltaTime;
            this.player.model.position.z -= Math.cos(theta) * this.speed * deltaTime;
        }
        if (this.events.left) {
            const theta = this.player.model.rotation.y + Math.PI / 2;
            this.player.model.position.x -= Math.sin(theta) * this.speed * deltaTime;
            this.player.model.position.z -= Math.cos(theta) * this.speed * deltaTime;
        }
        if (this.events.right) {
            const theta = this.player.model.rotation.y - Math.PI / 2;
            this.player.model.position.x -= Math.sin(theta) * this.speed * deltaTime;
            this.player.model.position.z -= Math.cos(theta) * this.speed * deltaTime;
        }
        if (this.events.jump) {
            this.player.jump();
        }
        if (this.events.leftClick) {
            // break block
            playerDestroyBlock();
            this.events.leftClick = false;
        }
        if (this.events.rightClick) {
            // place block
            playerPlaceBlock();
            this.events.rightClick = false; // prevent continuous placing
        }
        
        this.coordinatesElement.textContent = `x: ${Math.floor(this.player.model.position.x)} y: ${Math.floor(this.player.model.position.y)} z: ${Math.floor(this.player.model.position.z)}`
        this.player.tickGravity(deltaTime)
        // Camera follows the player
        //const offset = new THREE.Vector3(0, this.pitch, 3);
        // const offset = new THREE.Vector3(0, 0, 0.1);
        //offset.applyQuaternion(this.player.model.quaternion);
        //this.game.camera.position.copy(this.player.model.position.clone().add(offset));
        // 1st person camera: allow pitch (up/down) and yaw (left/right), but no roll
        this.game.camera.rotation.order = 'YXZ';
        const offset = new THREE.Vector3(0, 1, 0);
        //ca
        this.game.camera.position.copy(this.player.model.position);
        this.game.camera.rotation.set(this.pitch, this.player.model.rotation.y, 0); // Pitch and yaw, no roll
        this.game.camera.position.add(offset);
    }
    
    

}