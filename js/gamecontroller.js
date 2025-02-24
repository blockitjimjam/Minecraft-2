export class GameController {
    constructor(game) {
        this.game = game;
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
    executeEvents() {
        if (this.events.forward) {
            this.game.camera.position.z -= 0.1;
        }
        if (this.events.backward) {
            this.game.camera.position.z += 0.1;
        }
        if (this.events.left) {
            this.game.camera.position.x -= 0.1;
        }
        if (this.events.right) {
            this.game.camera.position.x += 0.1;
        }
    }

}