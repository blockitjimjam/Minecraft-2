

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
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    }
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        this.composer = new THREE.EffectComposer(this.renderer, new THREE.WebGLRenderTarget(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio));
        this.composer.setSize(window.innerWidth, window.innerHeight);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
        const canvas = this.renderer.domElement;
         canvas.addEventListener('click', () => {
           canvas.requestPointerLock();
        });
        // document.addEventListener('mousemove', (event) => {
        //     if (document.pointerLockElement === canvas) {
        //         this.camera.rotation.x -= event.movementY * 0.005;
        //         this.camera.rotation.y -= event.movementX * 0.005;
        //         this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.x));
        //     }
        // });
        this.accumulationBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
        });
    
        this.accumulationMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tCurrent: { value: null },
                tLast: { value: null },
                blendFactor: { value: 5 }, // Adjust for more or less blur
            },
            vertexShader: ` 
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tCurrent;
                uniform sampler2D tLast;
                uniform float blendFactor;
                varying vec2 vUv;
    
                void main() {
                    vec4 current = texture2D(tCurrent, vUv);
                    vec4 last = texture2D(tLast, vUv);
                    gl_FragColor = mix(current, last, blendFactor);
                }
            `,
        });
    
        this.accumulationPass = new THREE.ShaderPass(this.accumulationMaterial);
        this.composer.addPass(this.accumulationPass);
    }
}