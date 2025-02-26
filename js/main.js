
import Stats from 'https://unpkg.com/three@latest/examples/jsm/libs/stats.module.js';
import { createNoise2D } from 'https://cdn.skypack.dev/simplex-noise@4.0.3';
import { Game } from './initscene.js';
import { GameController } from './gamecontroller.js';
import { Player } from './player.js';
const game = new Game();
const manager = new THREE.LoadingManager(() => {
    loadBlocks();
})
const textureLoader = new THREE.TextureLoader(manager);
const stats = new Stats();
document.body.appendChild(stats.dom);
const terrainCubes = [];
const terrainBoxes = [];
window.loadBlocks = false;
const noise = createNoise2D();

const textures = {
    Dirt: textureLoader.load("../assets/dirt.jpg"),
    Grass: textureLoader.load("../assets/grass.jpg"),
    Stone: textureLoader.load("../assets/stone.jpg"),
    Snow: textureLoader.load("../assets/snow.jpg")
}
function getTexture(y) {
    if (y < -5) {
        return textures.Dirt;
    } else if (y < 3) {
        return textures.Grass;
    } else if (y < 15) {
        return textures.Stone;
    } else {
        return textures.Snow;
    }
}
function checkForSurroundings() {
    return true;
}
function loadBlocks() {
    window.loadBlocks = true;
    for (let x = 0; x < 10; x++) {
        for (let z = 0; z < 10; z++) {
            const y = Math.floor(noise(x / 50, z / 50) * 10);
            if (!checkForSurroundings()) {

            }
            const texture = getTexture(y)
            texture.magFilter = THREE.NearestFilter; 
            texture.minFilter = THREE.NearestFilter;
            const geometry = new THREE.BoxGeometry();
            const material = new THREE.MeshStandardMaterial({ map: texture });
            const cube = new THREE.Mesh(geometry, material);
            getTexture(y);
            cube.position.set(x, y, z);
            game.scene.add(cube);
            terrainCubes.push(cube);
            terrainBoxes.push(new THREE.Box3().setFromObject(cube));
        }
    }
}
// textureLoader.load('../assets/dirt.jpg', (texture) => {
//     texture.wrapS = THREE.RepeatWrapping;
//     texture.wrapT = THREE.RepeatWrapping;
//     texture.magFilter = THREE.NearestFilter;
//     texture.minFilter = THREE.LinearMipMapLinearFilter;
//     texture.generateMipmaps = false;
//     texture.repeat.set(1, 1);

//     const geometry = new THREE.BoxGeometry();
//     const material = new THREE.MeshStandardMaterial({ map: texture });

//     for (let x = 0; x < 30; x++) {
//         for (let z = 0; z < 30; z++) {
//             const y = Math.floor(noise(x / 30, z / 30) * 10);
//             const cube = new THREE.Mesh(geometry, material);
//             getTexture(y);
//             cube.position.set(x, y, z);
//             game.scene.add(cube);

//             // Store mesh and bounding box
//             terrainCubes.push(cube);
//             terrainBoxes.push(new THREE.Box3().setFromObject(cube));
//         }
//     }
// });


const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
game.scene.add(ambientLight);

const player = new Player(0, 0, 0, 0xFF0000, game, 20);
const gameController = new GameController(game, player);
gameController.addKeybindsListener();
let lastTime = performance.now();
function animate() {
    if (window.loadBlocks) {
        const now = performance.now();
        const deltaTime = (now - lastTime) / 1000;
        lastTime = now;
        stats.begin();
        gameController.executeEvents(deltaTime);
        if (player.checkCollisions(terrainBoxes)) {
            player.touchingGround = true;
        } else {
            player.touchingGround = false;
        }
        /*
        game.accumulationMaterial.uniforms.tLast.value = game.accumulationBuffer.texture;

        // Render scene normally
        game.renderer.setRenderTarget(game.accumulationBuffer);
        game.renderer.render(game.scene, game.camera);
        game.renderer.setRenderTarget(null);

        // Set current frame as input for the shader
        game.accumulationMaterial.uniforms.tCurrent.value = game.accumulationBuffer.texture;
        */
        game.renderer.render(game.scene, game.camera);
        //game.composer.render();
        stats.end();
    }
}
const targetFPS = 500;
const frameTime = 1000 / targetFPS;
setInterval(animate, frameTime);
window.addEventListener('resize', () => {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
});