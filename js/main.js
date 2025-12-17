import * as THREE from 'https://cdn.skypack.dev/three@0.138.0';
window.THREE = THREE
import Stats from 'https://unpkg.com/three@latest/examples/jsm/libs/stats.module.js';
import { createNoise2D } from 'https://cdn.skypack.dev/simplex-noise@4.0.3';
import seedrandom from 'https://cdn.skypack.dev/seedrandom';
import { textures } from './textures.js';
import { BlockTypes } from './blocktypes.js';
import { Game } from './initscene.js';
import { GameController } from './gamecontroller.js';
import { Player } from './player.js';

const game = new Game();

const stats = new Stats();
document.body.appendChild(stats.dom);
const terrainBoxes = {};
const culledChunks = {};
const customBlocks = {};
const removedBlocks = {};
window.loadBlocks = false;
const rng = seedrandom('32434');
const noise = createNoise2D(rng);



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
let REACH = 5;
let SELECTED_BLOCK = 0;

// --- UI references ---
const blockMenuBtn = document.getElementById("block-menu-button");
const blockMenu = document.getElementById("block-menu");

// Toggle menu
blockMenuBtn.onclick = () => {
    blockMenu.style.display =
        blockMenu.style.display === "none" ? "block" : "none";
};

// Build menu
function buildBlockMenu() {
    blockMenu.innerHTML = "";

    for (const block of BlockTypes.values()) {
        const item = document.createElement("div");
        item.className = "block-item";
        if (block.id === SELECTED_BLOCK) item.classList.add("selected");

        const img = document.createElement("img");
        img.src = block.texture.image.currentSrc ?? block.texture.image.src;

        const label = document.createElement("div");
        label.textContent = block.name;

        item.appendChild(img);
        item.appendChild(label);

        item.onclick = () => {
            SELECTED_BLOCK = block.id;
            updateSelection();
        };

        blockMenu.appendChild(item);
    }
}
const canvas = document.querySelector("canvas");

document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement === canvas) {
        console.log("Pointer locked");
        gameController.controlsSuspended = false;
    } else {
        console.log("Pointer unlocked");
        gameController.controlsSuspended = true;
    }
});


function updateSelection() {
    document.querySelectorAll(".block-item").forEach(el => {
        el.classList.remove("selected");
    });

    const index = BlockTypes.values()
        .findIndex(b => b.id === SELECTED_BLOCK);

    if (index !== -1) {
        blockMenu.children[index].classList.add("selected");
    }
}

// Build once textures are loaded
const wait = setInterval(() => {
    if (window.loadBlocks) {
        clearInterval(wait);
        buildBlockMenu();
    }
}, 50);
let RENDER_DISTANCE = 2; // Number of chunks around the player to load
const CHUNK_HEIGHT = 15;
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
    const terrainHeight = Math.floor(noise(x / 50, z / 50) * CHUNK_HEIGHT);

    // Check surrounding terrain heights
    const neighbors = [
        Math.floor(noise((x + 1) / 50, z / 50) * CHUNK_HEIGHT),
        Math.floor(noise((x - 1) / 50, z / 50) * CHUNK_HEIGHT),
        Math.floor(noise(x / 50, (z + 1) / 50) * CHUNK_HEIGHT),
        Math.floor(noise(x / 50, (z - 1) / 50) * CHUNK_HEIGHT)
    ];

    // If any neighbor is 2 or more blocks below y, it means exposure
    return neighbors.some(neighborY => y - neighborY >= 2);
}
function playerPlaceBlock() {
    const direction = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(game.camera.quaternion)
        .normalize();

    const raycaster = new THREE.Raycaster(
        game.camera.position,
        direction,
        0,
        REACH
    );
    

    const intersects = raycaster.intersectObjects(
        Object.values(terrainCubes).flat(),
        false
    );

    if (intersects.length === 0) return false;

    const intersect = intersects[0];

    // World-space normal
    const normal = intersect.face.normal
        .clone()
        .transformDirection(intersect.object.matrixWorld)
        .round(); // important

    // Base block position (the one we hit)
    const basePos = intersect.object.position.clone();

    // Target position = adjacent block
    const position = basePos.add(normal);

    const chunkX = Math.floor(position.x / CHUNK_SIZE);
    const chunkZ = Math.floor(position.z / CHUNK_SIZE);
    const chunkKey = `${chunkX},${chunkZ}`;

    if (!terrainCubes[chunkKey]) {
        terrainCubes[chunkKey] = [];
    }
    if (!customBlocks[chunkKey]) {
        customBlocks[chunkKey] = [];
    }

    customBlocks[chunkKey].push({
        x: position.x,
        y: position.y,
        z: position.z,
        blockType: SELECTED_BLOCK
    });

    terrainCubes[chunkKey].push(
        placeCustomBlock(position.x, position.y, position.z, chunkKey, SELECTED_BLOCK)
    );

    return true;
}




function loadChunk(chunkX, chunkZ) {
    const chunkKey = `${chunkX},${chunkZ}`;
    if (chunks[chunkKey]) return;

    chunks[chunkKey] = true;
    terrainCubes[chunkKey] = [];
    terrainBoxes[chunkKey] = [];

    // Load terrain first
    for (let x = chunkX * CHUNK_SIZE; x < (chunkX + 1) * CHUNK_SIZE; x++) {
        for (let z = chunkZ * CHUNK_SIZE; z < (chunkZ + 1) * CHUNK_SIZE; z++) {
            const y = Math.floor(noise(x / 50, z / 50) * CHUNK_HEIGHT);

            if (checkForSurroundings(x, y, z)) {
                const block1 = placeBlock(x, y - 1, z, chunkKey);
                if (block1) terrainCubes[chunkKey].push(block1);
                if (checkForSurroundings(x, y - 1, z)) {
                    const block2 = placeBlock(x, y - 2, z, chunkKey);
                    if (block2) terrainCubes[chunkKey].push(block2);
                }
            }
            if (y > -12) {
                const block = placeBlock(x, y, z, chunkKey);
                if (block) terrainCubes[chunkKey].push(block);
            } else {
                const block = placeBlock(x, y, z, chunkKey);
                if (block) terrainCubes[chunkKey].push(block);
                if (y != -12) {
                    terrainCubes[chunkKey].push(placeWater(x, z, chunkKey));
                }
            }
        }
    }

    // Rebuild custom placed blocks
    if (customBlocks[chunkKey]) {
        customBlocks[chunkKey].forEach(blockData => {
            if (!removedBlocks[chunkKey]) {
                removedBlocks[chunkKey] = [];
            }
            const isRemoved = removedBlocks[chunkKey].some(b => 
                b.x === blockData.x && b.y === blockData.y && b.z === blockData.z
            );
            if (!isRemoved) {
                terrainCubes[chunkKey].push(
                    placeCustomBlock(blockData.x, blockData.y, blockData.z, chunkKey, blockData.blockType)
                );
            }   
        });
    }
}

function placeBlock(x, y, z, chunkKey) {
    const texture = getTexture(y);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    if (removedBlocks[chunkKey]) {
        const isRemoved = removedBlocks[chunkKey].some(b => 
            b.x === x && b.y === y && b.z === z
        );
        if (isRemoved) return null; // Don't place this block
    }

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true });
    const cube = new THREE.Mesh(geometry, material);

    cube.userData.type = "notwater";
    cube.userData.chunkKey = chunkKey;

    cube.position.set(x, y, z);
    game.scene.add(cube);

    const box = new THREE.Box3().setFromObject(cube);

    // Link them together
    cube.userData.box = box;
    box.userData = { cube };

    if (!terrainBoxes[chunkKey]) {
        terrainBoxes[chunkKey] = [];
    }

    terrainBoxes[chunkKey].push(box);

    return cube;
}

function playerDestroyBlock() {
    const direction = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(game.camera.quaternion)
        .normalize();

    const raycaster = new THREE.Raycaster(
        game.camera.position,
        direction,
        0,
        REACH
    );

    const intersects = raycaster.intersectObjects(
        Object.values(terrainCubes).flat(),
        false
    );

    if (intersects.length === 0) return false;

    const block = intersects[0].object;
    const chunkKey = block.userData.chunkKey;
    if (!removedBlocks[chunkKey]) {
        removedBlocks[chunkKey] = [];
    }

    removedBlocks[chunkKey].push({
        x: block.position.x,
        y: block.position.y,
        z: block.position.z
    });

    // Remove mesh
    game.scene.remove(block);
    block.geometry.dispose();
    block.material.dispose();


    // Remove cube from terrainCubes
    const cubeIndex = terrainCubes[chunkKey].indexOf(block);
    if (cubeIndex !== -1) {
        terrainCubes[chunkKey].splice(cubeIndex, 1);
    }

    // Remove Box3 from terrainBoxes
    const box = block.userData.box;
    const boxIndex = terrainBoxes[chunkKey].indexOf(box);
    if (boxIndex !== -1) {
        terrainBoxes[chunkKey].splice(boxIndex, 1);
    }

    // Optional: cleanup empty chunks
    if (terrainCubes[chunkKey].length === 0) {
        delete terrainCubes[chunkKey];
        delete terrainBoxes[chunkKey];
        delete chunks[chunkKey];
    }

    return true;
}
function getTypeTexture(blocktype) {
    return blocktype.texture;
}

function placeCustomBlock(x, y, z, chunkKey, blocktype) {
    const texture = getTypeTexture(BlockTypes.fromId(blocktype));
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true });
    const cube = new THREE.Mesh(geometry, material);

    cube.userData.type = "notwater";
    cube.userData.chunkKey = chunkKey;
    cube.userData.blockType = blocktype;

    cube.position.set(x, y, z);
    game.scene.add(cube);

    const box = new THREE.Box3().setFromObject(cube);

    // Link cube ↔ box
    cube.userData.box = box;
    box.userData = { cube };

    if (!terrainBoxes[chunkKey]) {
        terrainBoxes[chunkKey] = [];
    }

    terrainBoxes[chunkKey].push(box);

    return cube;
}


function placeWater(x, z, chunkKey) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({
        map: textures.Water,
        transparent: true,
        opacity: 0.5,
        depthWrite: false
    });

    const cube = new THREE.Mesh(geometry, material);

    cube.userData.type = "water";
    cube.userData.chunkKey = chunkKey;

    cube.position.set(x, -12, z);
    game.scene.add(cube);

    const box = new THREE.Box3().setFromObject(cube);

    // Link cube ↔ box
    cube.userData.box = box;
    box.userData = { cube };

    if (!terrainBoxes[chunkKey]) {
        terrainBoxes[chunkKey] = [];
    }

    terrainBoxes[chunkKey].push(box);

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
            delete terrainBoxes[chunkKey];
            delete chunks[chunkKey];
        }
    }
}

function updateChunks(camera) {
    const playerX = Math.floor(player.model.position.x / CHUNK_SIZE);
    const playerZ = Math.floor(player.model.position.z / CHUNK_SIZE);

    for (let x = playerX - RENDER_DISTANCE; x <= playerX + RENDER_DISTANCE; x++) {
        for (let z = playerZ - RENDER_DISTANCE; z <= playerZ + RENDER_DISTANCE; z++) {
            const chunkKey = `${x},${z}`;

            // Skip reloading chunks that were recently culled
            if (culledChunks[chunkKey]) {
                chunks[chunkKey] = culledChunks[chunkKey];
                delete culledChunks[chunkKey];
                continue;
            }

            // Load new chunks
            if (!chunks[chunkKey]) {
                loadChunk(x, z);
            }
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
let blockHighlight;

function initBlockHighlight(scene) {
    const geometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.3,
        depthWrite: false
    });


    blockHighlight = new THREE.Mesh(geometry, material);
    blockHighlight.visible = false;
    blockHighlight.renderOrder = 999;


    scene.add(blockHighlight);
}


function updateBlockHighlight() {
    const direction = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(game.camera.quaternion)
        .normalize();

    const raycaster = new THREE.Raycaster(
        game.camera.position,
        direction,
        0,
        REACH
    );

    const intersects = raycaster.intersectObjects(
        Object.values(terrainCubes).flat(),
        false
    );

    if (intersects.length === 0) {
        blockHighlight.visible = false;
        return;
    }

    const intersect = intersects[0];

    // Position highlight exactly on block
    const blockPosition = intersect.object.position;

    blockHighlight.position.copy(blockPosition);
    blockHighlight.visible = true;
}

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
game.scene.add(ambientLight);

const player = new Player(0, 50, 0, 0xFF0000, game, 20);
window.player = player
const gameController = new GameController(game, player);
gameController.addKeybindsListener();
let lastTime = performance.now();
async function animate() {
    if (window.loadBlocks) {
        const now = performance.now();
        const deltaTime = (now - lastTime) / 1000;
        lastTime = now;
        stats.begin();
        gameController.executeEvents(deltaTime, playerPlaceBlock, playerDestroyBlock);
        if (await player.checkCollisions(terrainBoxes)) {
            player.touchingGround = true;
        } else {
            player.touchingGround = false;
        }
        // highlights current block the player is looking at
        updateBlockHighlight();

        updateChunks(game.camera);
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
initBlockHighlight(game.scene);

setInterval(animate, frameTime);
window.addEventListener('resize', () => {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
});