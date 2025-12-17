

export class Game {
    constructor() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
    }
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
    }
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    }
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        const canvas = this.renderer.domElement;
         canvas.addEventListener('click', () => {
           canvas.requestPointerLock();
        });
        
    }
}