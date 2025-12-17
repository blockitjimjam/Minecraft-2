import { textures } from "./textures.js";

// Enum-like class
export class BlockTypes {
    static Dirt         = new BlockTypes("Dirt", textures.Dirt, 0);
    static Grass        = new BlockTypes("Grass", textures.Grass, 1);
    static Stone        = new BlockTypes("Stone", textures.Stone, 2);
    static Snow         = new BlockTypes("Snow", textures.Snow, 3);
    static Water        = new BlockTypes("Water", textures.Water, 4);

    static Bricks       = new BlockTypes("Bricks", textures.Bricks, 5);
    static Cobblestone  = new BlockTypes("Cobblestone", textures.Cobblestone, 6);
    static Glass        = new BlockTypes("Glass", textures.Glass, 7);
    static GoldBlock    = new BlockTypes("GoldBlock", textures.GoldBlock, 8);
    static IronBlock    = new BlockTypes("IronBlock", textures.IronBlock, 9);
    static OakPlanks    = new BlockTypes("OakPlanks", textures.OakPlanks, 10);

    constructor(name, texture, id) {
        this.name = name;
        this.texture = texture;
        this.id = id;
    }

    toString() {
        return `BlockTypes.${this.name}`;
    }
    static values() {
        return Object.values(BlockTypes).filter(v => v instanceof BlockTypes);
    }
    
    static fromId(id) {
        return BlockTypes.values().find(b => b.id === id);
    }
}
