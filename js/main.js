import * as THREE from 'https://unpkg.com/three@latest/build/three.module.js';
import { Game } from './initscene.js';
import { GameController } from './gamecontroller.js';
import { Player } from './player.js';
const game = new Game();
for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 20; y++) {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, -1, y)
        game.scene.add(cube);
    
    }
    
}
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
const player = new Player(0, 0, 0, 0xFF0000, game);
cube.position.set(0, -1, 0)
game.scene.add(cube);
game.camera.position.z = 5;
const gameController = new GameController(game, player);
gameController.addKeybindsListener();
function animate() {
    requestAnimationFrame(animate);
    gameController.executeEvents();
    game.renderer.render(game.scene, game.camera);
}
animate();
window.addEventListener('resize', () => {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
});