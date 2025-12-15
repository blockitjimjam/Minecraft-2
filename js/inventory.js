export class Inventory {
    constructor(player) {
        this.hotbar = new Hotbar()
    }
    get getHotbar() {
        return this.hotbar
    }
    addItem(section, stack) {
        if (section == "Hotbar") {
            this.hotbar.addItem(stack)
        }
    }
}
export class Hotbar {
    constructor (player, inventory) {
        this.player = player
        this.inventory = inventory
        this.items = [];
    }
    
}
export class ItemStack {

}
export const ItemTypes = {
    Dirt: 0,
    Grass_Block: 1,
    Cobblestone: 2,
    Stone: 3,
    Sand: 4,
    Gravel: 5,
    Oak_Wood: 6,
    Birch_Wood: 7,
    Spruce_Wood: 8,
    Oak_Planks: 9,
    Birch_Planks: 10,
    Spruce_Planks: 11,
    Oak_Leaves: 12,
    Birch_Leaves: 13,
    Spruce_Leaves: 14,
    Glass: 15,
    Iron_Ore: 16,
    Coal_Ore: 17,
    Gold_Ore: 18,
    Diamond_Ore: 19,
    Emerald_Ore: 20
}