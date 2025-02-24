import * as THREE from 'https://unpkg.com/three@latest/build/three.module.js';
import { Game } from './initscene.js';
import { GameController } from './gamecontroller.js';
const game = new Game();
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
game.scene.add(cube);
game.camera.position.z = 5;
const gameController = new GameController(game);
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