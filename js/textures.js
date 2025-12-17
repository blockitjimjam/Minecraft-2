
const manager = new THREE.LoadingManager(() => {
    window.loadBlocks = true;
});

const textureLoader = new THREE.TextureLoader(manager);

export const textures = {
    Dirt: textureLoader.load("../assets/dirt.jpg"),
    Grass: textureLoader.load("../assets/grass.png"),
    Stone: textureLoader.load("../assets/stone.jpg"),
    Snow: textureLoader.load("../assets/snow.jpg"),
    Water: textureLoader.load("../assets/water.jpg"),

    Bricks: textureLoader.load("../assets/bricks.png"),
    Cobblestone: textureLoader.load("../assets/cobblestone.png"),
    Glass: textureLoader.load("../assets/glass.png"),
    GoldBlock: textureLoader.load("../assets/gold_block.png"),
    IronBlock: textureLoader.load("../assets/iron_block.png"),
    OakPlanks: textureLoader.load("../assets/oak_planks.png"),
    Beans: textureLoader.load("../assets/beans.png"),
};

