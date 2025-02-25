
import Stats from 'https://unpkg.com/three@latest/examples/jsm/libs/stats.module.js';

import { Game } from './initscene.js';
import { GameController } from './gamecontroller.js';
import { Player } from './player.js';

const game = new Game();
const textureLoader = new THREE.TextureLoader();
const stats = new Stats();
document.body.appendChild(stats.dom);
textureLoader.load('../assets/dirt.jpg', (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ map: texture });

    for (let x = 0; x < 100; x++) {
        for (let y = 0; y < 100; y++) {
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(x, -1, y);
            game.scene.add(cube);
        }
    }
});

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
game.scene.add(ambientLight);

const player = new Player(0, 0, 0, 0xFF0000, game);
const gameController = new GameController(game, player);
gameController.addKeybindsListener();
let lastTime = performance.now();
function animate() {
    const now = performance.now();
    const deltaTime = (now - lastTime) / 1000;
    lastTime = now;
    stats.begin();
    gameController.executeEvents(deltaTime);
    game.accumulationMaterial.uniforms.tLast.value = game.accumulationBuffer.texture;

    // Render scene normally
    game.renderer.setRenderTarget(game.accumulationBuffer);
    game.renderer.render(game.scene, game.camera);
    game.renderer.setRenderTarget(null);

    // Set current frame as input for the shader
    game.accumulationMaterial.uniforms.tCurrent.value = game.accumulationBuffer.texture;
    game.renderer.render(game.scene, game.camera);
    //game.composer.render();
    stats.end();
}
const targetFPS = 500;
const frameTime = 1000 / targetFPS; 
setInterval(animate, frameTime);
window.addEventListener('resize', () => {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
});