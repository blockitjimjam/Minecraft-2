
import Stats from 'https://unpkg.com/three@latest/examples/jsm/libs/stats.module.js';
import { createNoise2D } from 'https://cdn.skypack.dev/simplex-noise@4.0.3';
import { Game } from './initscene.js';
import { GameController } from './gamecontroller.js';
import { Player } from './player.js';
const game = new Game();
const manager = new THREE.LoadingManager(() => {
    window.loadBlocks = true;
})
const textureLoader = new THREE.TextureLoader(manager);
const stats = new Stats();
document.body.appendChild(stats.dom);
const terrainBoxes = [];
window.loadBlocks = false;
const noise = createNoise2D();

const textures = {
    Dirt: textureLoader.load("../assets/dirt.jpg"),
    Grass: textureLoader.load("../assets/grass.jpg"),
    Stone: textureLoader.load("../assets/stone.jpg"),
    Snow: textureLoader.load("../assets/snow.jpg"),
    Water: textureLoader.load("../assets/water.jpg")
}
function getTexture(y) {
    if (y < -10) {
        return textures.Dirt;
    } else if (y < 3) {
        return textures.Grass;
    } else if (y < 15) {
        return textures.Stone;
    } else {
        return textures.Snow;
    }
}
let CHUNK_SIZE = 8;
let RENDER_DISTANCE = 2; // Number of chunks around the player to load
const CHUNK_HEIGHT = 25;
document.getElementById("settings").addEventListener("click", () => {
    if (document.getElementById("settingsmenu").style.display == "none") {
        document.getElementById("settingsmenu").style.display = "block";
    } else {
        document.getElementById("settingsmenu").style.display = "none"
    }
});
document.getElementById("renderDistance").addEventListener("input", () => {
    RENDER_DISTANCE = Number(document.getElementById("renderDistance").value);
});
document.getElementById("chunkSize").addEventListener("input", () => {
    RENDER_DISTANCE = Number(document.getElementById("chunkSize").value);
});
let chunks = {}; // Tracks loaded chunks
let terrainCubes = {}; // Store cubes per chunk

function checkForSurroundings(x, y, z) {
    return !terrainCubes[`${x},${y - 1},${z}`]; // True if no block below
}

function loadChunk(chunkX, chunkZ) {
    const chunkKey = `${chunkX},${chunkZ}`;
    if (chunks[chunkKey]) return; // Prevent reloading

    chunks[chunkKey] = true;
    terrainCubes[chunkKey] = []; // Store blocks for this chunk

    for (let x = chunkX * CHUNK_SIZE; x < (chunkX + 1) * CHUNK_SIZE; x++) {
        for (let z = chunkZ * CHUNK_SIZE; z < (chunkZ + 1) * CHUNK_SIZE; z++) {
            const y = Math.floor(noise(x / 50, z / 50) * CHUNK_HEIGHT);

            if (checkForSurroundings(x, y, z)) {
                terrainCubes[chunkKey].push(placeBlock(x, y - 1, z)); // Support block
                if (checkForSurroundings(x, y - 1, z)) {
                    terrainCubes[chunkKey].push(placeBlock(x, y - 2, z));
                }
            }
            if (y > -12) {
                terrainCubes[chunkKey].push(placeBlock(x, y, z));
            } else {
                terrainCubes[chunkKey].push(placeBlock(x, y, z));
                if (y != -12) {
                    terrainCubes[chunkKey].push(placeWater(x, z));
                }
            }
        }
    }
}

function placeBlock(x, y, z) {
    const texture = getTexture(y);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);
    cube.userData.type = "notwater";
    cube.position.set(x, y, z);
    game.scene.add(cube);

    return cube;
}
function placeWater(x, z) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ 
        map: textures.Water,
        transparent: true,
        opacity: 0.5,
        depthWrite: false

    });
    const cube = new THREE.Mesh(geometry, material);
    cube.userData.type = "water";
    cube.position.set(x, -12, z);
    game.scene.add(cube);

    return cube;
}
function unloadFarChunks(playerX, playerZ) {
    for (const chunkKey in chunks) {
        const [chunkX, chunkZ] = chunkKey.split(',').map(Number);

        // If chunk is outside the render distance, remove it
        if (Math.abs(chunkX - playerX) > RENDER_DISTANCE || Math.abs(chunkZ - playerZ) > RENDER_DISTANCE) {
            terrainCubes[chunkKey].forEach(cube => {
                game.scene.remove(cube);
                cube.geometry.dispose();
                cube.material.dispose();
            });

            delete terrainCubes[chunkKey];
            delete chunks[chunkKey];
        }
    }
}

function updateChunks() {
    const playerX = Math.floor(player.model.position.x / CHUNK_SIZE);
    const playerZ = Math.floor(player.model.position.z / CHUNK_SIZE);

    for (let x = playerX - RENDER_DISTANCE; x <= playerX + RENDER_DISTANCE; x++) {
        for (let z = playerZ - RENDER_DISTANCE; z <= playerZ + RENDER_DISTANCE; z++) {
            loadChunk(x, z);
        }
    }

    unloadFarChunks(playerX, playerZ);
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
        if (player.checkCollisions(terrainCubes)) {
            player.touchingGround = true;
        } else {
            player.touchingGround = false;
        }
        updateChunks();
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