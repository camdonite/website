'use strict';
// Game:        Sandbox
// Developer:   Gage Coates (sg_p4x347)
// Date:        January, 2015 - present
// Synopsis:    A sandbox based mining/crafting game written in javascript, intended to be run in a browser.

//window.alert('This game is currently incomplete and buggy, feel free to be upset!')

//----------
// Variables
//----------

// html canvas element
var canvas = document.getElementById('mainCanvas');
var ctx = canvas.getContext('2d');
var statCanvas = document.getElementById('statusCanvas');
var statctx = statCanvas.getContext('2d');
// image interpolation off for IE, Chrome, Firefox
ctx['msImageSmoothingEnabled'] = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
statctx['msImageSmoothingEnabled'] = false;
statctx.webkitImageSmoothingEnabled = false;
statctx.mozImageSmoothingEnabled = false;
document.oncontextmenu = function () {
    return false;
};
// player coordinate
var px = 1;
var py = 125;
var sectorX = 0;
var sectorY = 0;
var worldPx;
var worldPy;
// player
var playerStats = { health: 100, thirst: 100, hunger: 100, fatigue: 100, oxygen: 100 };
var playerSkills = { survival: 0, woodcutting: 0, mining: 0, construction: 0, crafting: 0, smithing: 0, farming: 0, cooking: 0, hunting: 0 };
// block coordinate
var x;
var y;
// cursor coordinate on canvas
var cx;
var cy;
// movement and rendering precision, measured in game units
var p = 0.1;
// world size
var ww = 256;
var wh = 256;
// view scale (number of blocks displayed on screen, in width/height)
var vs = 16;
// canvas scale, or the number of pixels that the view takes both in width, and height
var cs = 1024;
// general math expressions
var csDivVs = cs / vs;
var halfCsDivVs = csDivVs / 2;
var vsDiv2 = vs / 2;
var halfCs = cs / 2;
var quarterCsDivVs = csDivVs / 4;
// world
var layer0 = newFilledArray((ww * wh), 0);
var layer1 = newFilledArray((ww * wh), 0);
var world = [];
var surface;
// time
var t = 0.016;
var startTime;
// menus
var menu = 0;
var userRoughness = 5;
var screens = new Image();
screens.src = "textures/screens.png";
var buttonHighlight = true;
// set to false on every click down, set to true on every click up, where it is required in order to execute a button.
var buttonLast = true;
// world editing
var blockMineUpdate;
var blockCrackUpdate;
var toolSpeed;
var equippedItem = { type: "", data: 0 ,count:0};
var equippedItemTexture = { type: blockSheet, sx:0,sy:0,size:8};
// block data
var textNamesBlocks = [
    'Air', 'Stone', 'Dirt', 'Grass', 'Sand', 'Elm Log', 'Elm Leaves', 'Elm Planks', 'Stone Tile', 'Rubble', 'Chest', 'Crafting Table',
    'Clay', 'Mud Bricks', 'Mud Brick Furnace', 'Copper Ore', 'Tin Ore', 'Iron Ore', 'Gold Ore', 'Coal Ore', 'Uranium Ore', 'Thorium Ore',
    'Water', 'Gravel', 'Clay Bricks', 'Clay Brick Furnace', 'Glass', 'Elm Door Bottom Closed', 'Elm Door Top Closed', 'Elm Door Bottom Open',
    'Elm Door Top Open', 'Bed Left', 'Bed Right', 'Lead Ore', 'Silver Ore', 'Ladder', 'Rope Ladder', 'Stone Stairs', 'Right Stone Stairs', 'Elm Stairs',
    'Right Elm Stairs', 'Stone Tile Stairs', 'Right Stone Tile Stairs', 'Rubble Stairs', 'Right Rubble Stairs', 'Brick Stairs', 'Right Brick Stairs',
    'Stone Slab','Elm Slab','Stone Tile Slab','Rubble Slab','Brick Slab', 'Mantle','Elm Sapling'
];
// item data
var textNamesItems = [
    null, 'Wood Pickaxe', 'Stone Pickaxe', 'Copper Pickaxe', 'Bronze Pickaxe', 'Iron Pickaxe', 'Steel Pickaxe', 'Wood Shovel',
    'Stone SHovel', 'Copper Shovel', 'Bronze Shovel', 'Iron Shovel', 'Steel Shovel', 'Flint Axe', 'Copper Axe', 'Bronze Axe',
    'Iron Axe', 'Steel Axe', 'Elm Stick', 'Elm Twine', 'Flint', 'Mud Brick', 'Copper Pickaxe Head', 'Bronze Pickaxe Head',
    'Iron Pickaxe Head', 'Steel Pickaxe Head', 'Copper Shovel Head', 'Bronze Shovel Head', 'Iron Shovel Head', 'Steel Shovel Head',
    'Copper Axe Head', 'Bronze Axe Head', 'Iron Axe Head', 'Steel Axe Head', 'Pickaxe Head Cast', 'Shovel Head Cast',
    'Lesser Axe Head Cast', 'Greater Axe Head Cast', 'Sword Cast', 'Tool Rod', 'Bronze Sword', 'Iron Sword', 'Steel Sword', 'Clay Brick', 'Coal',
    'Ingot Cast', 'Twine Fabric', 'Twine Rope', 'Bed', 'Lead Ingot', 'Silver Ingot', 'Copper Ingot', 'Tin Ingot', 'Bronze Ingot', 'Iron Ingot', 'Steel Ingot',
    'Gold Ingot','Uranium Ingot','Thorium Ingot', 'Elm Door','M416', 'M1 Garand','1911 Colt','Thompson','World Destroyer', 'Bread'
];
// items that are tools
var textNamesTools = [
    'Wood Pickaxe', 'Stone Pickaxe', 'Copper Pickaxe', 'Bronze Pickaxe', 'Iron Pickaxe', 'Steel Pickaxe', 'Wood Shovel',
    'Stone SHovel', 'Copper Shovel', 'Bronze Shovel', 'Iron Shovel', 'Steel Shovel', 'Flint Axe', 'Copper Axe', 'Bronze Axe',
    'Iron Axe', 'Steel Axe', , 'Pickaxe Head Cast', 'Shovel Head Cast', 'Lesser Axe Head Cast', 'Greater Axe Head Cast', 'Sword Cast',
    'Bronze Sword','Ingot Cast', 'Iron Sword', 'Steel Sword', 'M416', 'M1 Garand', '1911 Colt', 'Thompson', 'World Destroyer'
];
var blockDurabilty = {
    'Air': 0, 'Stone': 0.6, 'Dirt': 0.15, 'Grass': 0.2, 'Sand': 0.1, 'Elm Log': 1, 'Elm Leaves': 0.2, 'Elm Planks': 0.3, 'Stone Tile': 0.45,
    'Rubble': 0.4, 'Chest': 0.5, 'Crafting Table': 0.5, 'Clay': 0.2, 'Mud Bricks': 0.25, 'Mud Brick Furnace': 0.25, 'Copper Ore': 0.65, 'Tin Ore': 0.65,
    'Iron Ore': 1, 'Gold Ore': 0.7, 'Coal Ore': .5, 'Uranium Ore': 1, 'Thorium Ore': 1, 'Gravel': 0.175, 'Clay Bricks': 0.55, 'Clay Brick Furnace': 0.55,
    'Glass': 0.1, 'Elm Door Bottom Closed': 0.3, 'Elm Door Top Closed': 0.3, 'Elm Door Bottom Open': 0.3, 'Elm Door Top Open': 0.3, 'Bed Left': 0.3, 'Bed Right': 0.3,
    'Lead Ore': 1, 'Silver Ore':1,'Ladder':0.2,'Rope Ladder':0.175, 'Stone Stairs':0.6, 'Right Stone Stairs':0.6, 'Elm Stairs':0.3,
    'Right Elm Stairs':0.3, 'Stone Tile Stairs':0.45, 'Right Stone Tile Stairs':0.45, 'Rubble Stairs':0.4, 'Right Rubble Stairs':0.4, 'Brick Stairs':0.55, 'Right Brick Stairs':0.55,
    'Stone Slab':0.6,'Elm Slab':0.3,'Stone Tile Slab':0.45,'Rubble Slab':0.4,'Brick Slab':0.55, 'Mantle':0
};
// minimum tool tier to drop anything, if listed, else no tier is required
var blockTier = {
    'Stone': 1, 'Copper Ore': 2, 'Tin Ore': 3, 'Iron Ore': 4, 'Coal Ore': 2, 'Gold Ore': 5, 'Uranium Ore': 6, 'Thoruim Ore': 6, 'Glass': 7, 'Stone Stairs': 1, 
    'Right Stone Stairs':1,'Clay Bricks':1, 'Clay Brick Furnace':1, 'Lead Ore':5, 'Silver Ore':6, 'Ladder':1, 'Brick Stairs':1, 'Right Brick Stairs':1,
    'Stone Slab':1,'Brick Slab':1};
var blockTypeStone = [
    'Stone', 'Stone Tile', 'Rubble', 'Mud Bricks', 'Mud Brick Furnace', 'Copper Ore', 'Tin Ore', 'Iron Ore', 'Gold Ore', 'Coal Ore',
    'Uranium Ore', 'Thorium Ore', 'Clay Bricks', 'Clay Brick Furnace', 'Glass', 'Lead Ore', 'Silver Ore', 'Stone Stairs', 'Right Stone Stairs',
    'Stone Tile Stairs', 'Right Stone Tile Stairs', 'Rubble Stairs', 'Right Rubble Stairs', 'Brick Stairs', 'Right Brick Stairs',
    'Stone Slab', 'Elm Slab', 'Stone Tile Slab', 'Rubble Slab', 'Brick Slab'
];
var blockTypeDirt = [
    'Dirt', 'Grass', 'Sand', 'Clay', 'Gravel', 'Glass'
];
var blockTypeWood = [
    'Elm Log', 'Elm Leaves', 'Elm Planks', 'Chest', 'Crafting Table', 'Glass','Elm Door Bottom Closed', 'Elm Door Top Closed', 'Elm Door Bottom Open',
    'Elm Door Top Open', 'Bed Left', 'Bed Right', 'Ladder', 'Rope Ladder', 'Elm Stairs', 'Right Elm Stairs'
];
var food = {
    'Bread': 25
};
var blockSheet = new Image();
blockSheet.src = "textures/blocks/block_sheet.png";
var itemSheet = new Image();
itemSheet.src = "textures/items/item_sheet.png";
// tool data
// tools index determines type of tool: pickaxe, shovel, axe. Order within inner array determines tier level.
var tools = [[null, 1, 2, 3, 4, 5, 6, 64], [null, 7, 8, 9, 10, 11, 12], [null, null, 13, 14, 15, 16, 17]];
var helpPage = '';

//------------------------
// Miscellaneous Functions
//------------------------

var guiNames = ['screens', 'interface', 'font'];
var gui = [];
guiNames.forEach(function (element) {
    var images = new Image();
    images.src = "textures/" + element + ".png";
    gui.push(images);
});
function preloadimages(arr) {
    var newimages = [], loadedimages = 0
    var postaction = function () { }
    var arr = (typeof arr != "object") ? [arr] : arr
    function imageloadpost() {
        loadedimages++
        if (loadedimages == arr.length) {
            postaction(newimages) //call postaction and pass in newimages array as parameter
        }
    }
    for (var i = 0; i < arr.length; i++) {
        newimages[i] = new Image()
        newimages[i].src = arr[i]
        newimages[i].onload = function () {
            imageloadpost()
        }
        newimages[i].onerror = function () {
            imageloadpost()
        }
    }
    return { //return blank object with done() method
        done: function (f) {
            postaction = f || postaction //remember user defined callback functions to be called when images load
        }
    }
};
// mouse game coordinate
function mouse() {
    return {
        x: (((cx - halfCs) / csDivVs) + px),
        y: (((cy - halfCs) / csDivVs) + py)
    };
};
// fill array with zeroes
function newFilledArray(len, val) {
    var ar = Array(len);
    while (--len >= 0) {
        ar[len] = val;
    };
    return ar;
};
// index value of world block
function index(x, y) {
    return ( x + (y * ww));
};
// get the mouse position on canvas
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
};
// text in Sandbox 1 font
var fontIndex = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z','_','-',':',';','.',',','(',')','','?','/','"\"','!','"',"'",'{','}'];
function text(string, x, y, size, canvas) {
    for (var index = 0; index < string.length; index++) {
        var element = fontIndex.indexOf(string.toLowerCase().charAt(index));
        if (element == -1) { element = 45 };
        var sy = Math.floor(element / 85);
        var sx = element - (sy * 85);
        switch (canvas) {
            case 'stat':
                statctx.drawImage(gui[2], sx * 6, sy * 12, 6, 12, (((size / 2) * index) * (7 / 6)) + x, y, size / 2, size);
                break;
            default:
                ctx.drawImage(gui[2], sx * 6, sy * 12, 6, 12, (((size / 2) * index) * (7 / 6)) + x, y, size / 2, size);
                break;
        };      
    };
};
// convert Relative sector coordinate to an absolute global coordinate
function relToAbs(secX, secY, x, y) {
    return [
        (x + (secX * 256)),
        (y + (secY * 256))
    ];
};
// convert Absolute global coordinate to a position coordinate within the sector
function absToRel(absX, absY) {
    var sectorX = Math.floor(absX/256);
    var sectorY = Math.floor(absY/256);
    return [
        (absX - (sectorX * 256)),
        (absY - (sectorY * 256))
    ];
};
// compare TDC values (Type, Data, Count). mode: undefined obj1.count <= obj2.count, 0 obj1.count == obj2.count
function compareTDC(obj1, obj2, mode) {
    switch (mode) {
        case 0:
            if ((obj1.type == obj2.type) && (obj1.data == obj2.data) && (obj1.count <= obj2.count)) {
                return true;
            } else { 
                return false;
            };
            break;
        default: 
            if ((obj1.type == obj2.type) && (obj1.data == obj2.data)) {
                return true;
            } else { 
                return false;
            };
            break;
    };
};
function probability(chance) {
    if (Math.round(Math.random() * chance) == 0) {
        return true;
    };
};

//----------
// Rendering
//----------

var underwater = false;
function animLoop() {
    if (!stopAnimLoop) {
        window.requestAnimFrame(animLoop);
        //startTime = new Date();           
        render();
        //t = ((new Date().getTime()) - startTime.getTime()) / 200;
        if (!pausePhysics) {
            playerPhysics(pxvel, pyvel, pxacc, pyacc, pxfr, pyfr, g, t);
            entityItems.forEach(function (element) {
                element.update(element.type, element.data, element.coord, element.xvel, element.yvel, element.xacc, element.yacc, element.g);
            });
            // pick up item drops
            entityItems.forEach(function (element, index) {
                var coord = absToRel(element.coord[0], element.coord[1]);
                if ((Math.abs(px - coord[0]) <= 0.5) && (Math.abs(py - coord[1]) <= 1)) {
                    var s = 0;
                    while (!((storageObjects[1].data[s].type == element.type) && (storageObjects[1].data[s].data == element.data) && (storageObjects[1].data[s].count < 256))) {
                        s++;
                        if (s == 36) { break; };
                    };
                    if (s == 36) {
                        s = 0;
                        while (!(storageObjects[1].data[s].type == "")) {
                            s++;
                            if (s == 36) { break; };
                        };
                    };
                    if (s < 36) {
                        storageObjects[1].data[s].type = element.type;
                        storageObjects[1].data[s].data = element.data;
                        storageObjects[1].data[s].count += 1;
                        updateEquippedItem();
                        entityItems.splice(index, 1);
                    };
                };
            });
        };
        // slower update
        if (updateCounter == 6) {
            clockUpdate();
            updateCounter = 0;
        } else { updateCounter++; };
    };
};
// shim layer with setTimeout fallback
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000/60);
            };
})();
// render blocks
function render() {
    if (!pauseRender) {
        ctx.fillStyle = "rgb(135,206,235)";
        ctx.fillRect(0, 0, cs, cs);
        var currentLeft = topLeft().x;
        var currentTop = topLeft().y;
        for (y = Math.round(currentTop) ; y < Math.round(currentTop) + vs + 1 ; y++) {
            var yCoord = Math.round(((y - currentTop) * csDivVs) - halfCsDivVs);
            for (x = Math.round(currentLeft) ; x < Math.round(currentLeft) + vs + 1; x++) {
                if ((x >= 0) && (x <= 256) && (y >= 0) && (y <= 256)) {
                    var blockType = layer0[index(x, y)];
                    if ([0, 6, 10, 22, 26, 27, 28, 30, 31, 32, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 53].indexOf(blockType) != -1) {
                        renderLayer1();
                    } else if (null == blockType) {
                        blockType = 0
                    };
                    var sy = Math.floor(blockType / 32);
                    var sx = blockType - (sy * 32);
                    ctx.drawImage(blockSheet, sx * 8, sy * 8, 8, 8, Math.round(((x - currentLeft) * csDivVs) - halfCsDivVs), yCoord, csDivVs, csDivVs);
                    if (blockType == 14) {
                        storageObjects.forEach(function (object, Index) {
                            if (Index > 5) {
                                var coord = absToRel(object.coord[0], object.coord[1]);
                                if ((coord[0] == x) && (coord[1] == y)) {
                                    smeltingOperations.some(function (operation) {
                                        if (operation.index == Index) {
                                            ctx.drawImage(gui[1], 164, 0, 8, 8, Math.round(((x - currentLeft) * csDivVs) - halfCsDivVs), yCoord, csDivVs, csDivVs);
                                            return true;
                                        };
                                    });
                                    return true;
                                };
                            };
                        });
                    };
                };
            };
        };
        // render block cracks
        if (plrArmAction && (index(x, y) != 0)) {
            ctx.drawImage(player, blockCrackX << 5, blockCrackY << 6, 32, 32, (((Math.round(mouse().x) - currentLeft) * csDivVs) - halfCsDivVs), (((Math.round(mouse().y) - currentTop) * csDivVs) - halfCsDivVs), csDivVs, csDivVs);
        };
        // render item entities
        entityItems.forEach(function (element, index) {
            if (element.type != "") {
                var sy = Math.floor(element.data / 32);
                var sx = element.data - (sy * 32);
                var coord = absToRel(element.coord[0], element.coord[1]);
                if (element.type == "block") {
                    ctx.drawImage(blockSheet, sx * 8, sy * 8, 8, 8, Math.round(((coord[0] - currentLeft) * csDivVs) - quarterCsDivVs), Math.round(((coord[1] - currentTop) * csDivVs) - quarterCsDivVs), halfCsDivVs, halfCsDivVs);
                } else {
                    ctx.drawImage(itemSheet, sx * 32, sy * 32, 32, 32, Math.round(((coord[0] - currentLeft) * csDivVs) - quarterCsDivVs), Math.round(((coord[1] - currentTop) * csDivVs) - quarterCsDivVs), 48, 48);
                };
            };
        });
        // render player
        ctx.drawImage(player, plrBodyx << 5, plrBodyy << 6, 32, 64, halfCs - halfCsDivVs, halfCs - csDivVs, csDivVs, csDivVs << 1);
        // render player's arm/w rotation if necessary
        if (plrArmAction) {
            ctx.translate(halfCs, halfCs - 14);
            ctx.rotate(plrArmRot);
            if (equippedItem.count > 0) {
                ctx.drawImage(equippedItemTexture.type, equippedItemTexture.sx * equippedItemTexture.size, equippedItemTexture.sy * equippedItemTexture.size, equippedItemTexture.size, equippedItemTexture.size, 0, halfCsDivVs, halfCsDivVs, halfCsDivVs);
            };
            ctx.drawImage(player, plrArmx << 5, plrArmy << 6, 32, 64, -halfCsDivVs, -csDivVs + 14, csDivVs, csDivVs << 1);
            ctx.rotate(-plrArmRot);
            ctx.translate(-halfCs, -(halfCs - 14));
        } else {
            if (equippedItem.count > 0) {
                ctx.drawImage(equippedItemTexture.type, equippedItemTexture.sx * equippedItemTexture.size, equippedItemTexture.sy * equippedItemTexture.size, equippedItemTexture.size, equippedItemTexture.size, halfCs - quarterCsDivVs, halfCs, halfCsDivVs, halfCsDivVs);
            };
            ctx.drawImage(player, plrArmx << 5, plrArmy << 6, 32, 64, halfCs - halfCsDivVs, halfCs - csDivVs, csDivVs, csDivVs << 1);
        };
    };
    // render storage GUIs
    if (inventory) {
        // draw inventory
        ctx.drawImage(gui[1], 0, 20, 80, 64, 192, 512, 640, 512);
        // draw extra GUIs if necessary
        var GUItype = storageObjects[storageGUI].type;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        if (storageGUI > 2) {
            switch (GUItype) {
                case "chest": ctx.drawImage(gui[1], 0, 108, 80, 64, 192, 0, 640, 512); break;
                case "crafting":
                    ctx.drawImage(gui[1], 80, 0, 64, 48, 320, 128, 512, 384);
                    ctx.drawImage(gui[1], 32, 188, 16, 16, 704, 128, 128, 128);
                    ctx.drawImage(gui[1], 32, 204, 16, 8, 704, 448, 128, 64);
                    if ((704 < cx) && (cx < 832) && (128 < cy) && (cy < 256)) {
                        // help button
                        if (click) {
                            storageObjects[4].data = [];
                            storageGUI = 4;
                            craftingRecipes.forEach(function (recipe) {
                                storageObjects[storageGUI].data.push(recipe.output);
                            });
                            helpPage = 'crafting';
                            return;
                        } else {
                            ctx.fillRect(704, 128, 128, 128);
                        };
                    } else if ((704 < cx) && (cx < 832) && (448 < cy) && (cy < 512)) {
                        // clear button
                        ctx.fillRect(704, 448, 128, 64);
                    };
                    break;
                case "smelting":
                    ctx.drawImage(gui[1], 80, 48, 64, 48, 320, 128, 512, 384);
                    ctx.drawImage(gui[1], 32, 188, 16, 24, 704, 128, 128, 192);
                    if ((704 < cx) && (cx < 832) && (128 < cy) && (cy < 256)) {
                        // help button
                        if (click) {
                            storageObjects[4].data = [];
                            storageGUI = 4;
                            smeltingRecipes.forEach(function (recipe) {
                                storageObjects[storageGUI].data.push(recipe.output);
                            });
                            helpPage = 'smelting';
                            return;
                        } else {
                            ctx.fillRect(704, 128, 128, 128);
                        };
                    } else if ((704 < cx) && (cx < 832) && (256 < cy) && (cy < 320)) {
                        // clear button
                        ctx.fillRect(704, 256, 128, 64);
                    };8999999999
                    var search = false;
                    smeltingOperations.some(function (operation) {
                        if (operation.index == storageGUI) {
                            var pixel = Math.round(19 * operation.time);
                            if (pixel != 0) {
                                ctx.drawImage(gui[1], 144, 0, pixel, 14, 640, 360, pixel * 8, 112);
                            };
                            ctx.drawImage(gui[1], 144, 14, 32, 20, 384, 312, 256, 160);
                            return true;
                        };
                    });
                    break;
                case "invcrafting":
                    ctx.drawImage(gui[1], 0, 188, 32, 24, 384, 320, 256, 192);
                    ctx.drawImage(gui[1], 32, 188, 16, 24, 640, 320, 128, 192);
                    if ((640 < cx) && (cx < 768) && (320 < cy) && (cy < 448)) {
                        // help button
                        if (click) {
                            storageObjects[4].data = [];
                            storageGUI = 4;
                            craftingRecipes.forEach(function (recipe) {
                                if (recipe.type == 'conversion') {
                                    storageObjects[storageGUI].data.push(recipe.output);
                                };
                            });
                            helpPage = 'invcrafting';
                            return;
                        } else {
                            ctx.fillRect(640, 320, 128, 128);
                        };
                    } else if ((640 < cx) && (cx < 768) && (448 < cy) && (cy < 512)) {
                        // clear button
                        ctx.fillRect(640, 448, 128, 64);
                    };
                    break;
                case 'help':
                    ctx.drawImage(gui[1], 0, 220, 128, 64, 0, 0, cs, halfCs);
                    break;
            };
        };
        // draw hotbar selectors
        ctx.drawImage(gui[1], 10, 0, 10, 10, (selectionIndex[equipmentIndex] * 64) + 216, 856, 80, 80);
        ctx.drawImage(gui[1], 20, 0, 10, 10, (equipmentIndex * 64) + 216, 920, 80, 80);
        if ((cx > 224) && (cx < 800) && (cy > 544) && (cy < 800)) {
            // inventory
            storageHoverIndex = 1;
            inventoryHoverX = Math.floor((cx - 224) / 64);
            inventoryHoverY = Math.floor((cy - 544) / 64);
            ctx.drawImage(gui[1], 0, 0, 10, 10, (inventoryHoverX * 64) + 216, (inventoryHoverY * 64) + 536, 80, 80);
        } else if ((GUItype == "invcrafting") && (((cx > 416) && (cx < 480) && (cy > 352) && (cy < 416)) || ((cx > 544) && (cx < 608) && (cy > 352) && (cy < 480)))) {
            // inventory crafting
            storageHoverIndex = storageGUI;
            inventoryHoverX = Math.floor((cx - 416) / 64);
            inventoryHoverY = Math.floor((cy - 352) / 64);
            if (((inventoryHoverX == 0) && (inventoryHoverY == 0)) || ((inventoryHoverX == 2) && (inventoryHoverY >= 0) && (inventoryHoverY <= 1))) {
                ctx.drawImage(gui[1], 0, 0, 10, 10, (inventoryHoverX * 64) + 408, (inventoryHoverY * 64) + 344, 80, 80);
            };
        } else if ((cx > 224) && (cx < 800) && (cy > 864) && (cy < 992)) {
            // hotbar
            storageHoverIndex = 2;
            inventoryHoverX = Math.floor((cx - 224) / 64);
            inventoryHoverY = Math.floor((cy - 864) / 64);
            ctx.drawImage(gui[1], 0, 0, 10, 10, (inventoryHoverX * 64) + 216, (inventoryHoverY * 64) + 856, 80, 80);
        } else if ((storageGUI > 3) && (GUItype == "chest") && (cx > 224) && (cx < 800) && (cy > 32) && (cy < 480)) {
            // chest
            storageHoverIndex = storageGUI;
            inventoryHoverX = Math.floor((cx - 224) / 64);
            inventoryHoverY = Math.floor((cy - 32) / 64);
            ctx.drawImage(gui[1], 0, 0, 10, 10, (inventoryHoverX * 64) + 216, (inventoryHoverY * 64) + 24, 80, 80);
        } else if ((storageGUI > 3) && (GUItype == "crafting") && (((cx > 352) && (cx < 672) && (cy > 160) && (cy < 480)) || ((cx > 736) && (cx < 800) && (cy > 288) && (cy < 416)))) {
            // crafting
            storageHoverIndex = storageGUI;
            inventoryHoverX = Math.floor((cx - 352) / 64);
            inventoryHoverY = Math.floor((cy - 160) / 64);
            if (((inventoryHoverX >= 0) && (inventoryHoverX <= 4) && (inventoryHoverY >= 0) && (inventoryHoverY <= 4)) || ((inventoryHoverX == 6) && (inventoryHoverY > 1) && (inventoryHoverY < 4))) {
                ctx.drawImage(gui[1], 0, 0, 10, 10, (inventoryHoverX * 64) + 344, (inventoryHoverY * 64) + 152, 80, 80);
            };
        } else if ((storageGUI > 3) && (GUItype == "smelting") && ((cx > 320) && (cx < 832) && (cy > 128) && (cy < 512))) {
            // smelting
            storageHoverIndex = storageGUI;
            inventoryHoverX = Math.floor((cx - 416) / 64);
            inventoryHoverY = Math.floor((cy - 288) / 64);
            if (((inventoryHoverX == 0) && (inventoryHoverY == 0)) || ((inventoryHoverX == 2) && (inventoryHoverY == 0)) || ((inventoryHoverX == 1) && (inventoryHoverY == 2)) ||
                ((inventoryHoverX == 4) && (inventoryHoverY == 2)) || ((inventoryHoverX == 5) && (inventoryHoverY == 1)) || ((inventoryHoverX == 5) && (inventoryHoverY == 2))) {
                ctx.drawImage(gui[1], 0, 0, 10, 10, (inventoryHoverX * 64) + 408, (inventoryHoverY * 64) + 280, 80, 80);
            };
        } else if ((storageGUI > 3) && (GUItype == "help") && (cx > 32) && (cx < 928) && (cy > 32) && (cy < 480)) {
            // help page
            storageHoverIndex = storageGUI;
            inventoryHoverX = Math.floor((cx - 32) / 64);
            inventoryHoverY = Math.floor((cy - 32) / 64);
            ctx.drawImage(gui[1], 0, 0, 10, 10, (inventoryHoverX * 64) + 24, (inventoryHoverY * 64) + 24, 80, 80);
        } else {
            storageHoverIndex = 0;
        };
        // display inventory items
        storageObjects[1].data.forEach(function (element, index) {
            renderItems(element, index, 224, 544, 9);
        });
        // display hotbar items
        displayHotbarItems();
        // display GUI items
        if (storageGUI > 2) {
            storageObjects[storageGUI].data.forEach(function (element, index) {
                switch (storageObjects[storageGUI].type) {
                    case "invcrafting":
                        renderItems(storageObjects[storageGUI].data[0], 0, 416, 352, 1);
                        renderItems(storageObjects[storageGUI].data[1], 0, 544, 352, 1);
                        renderItems(storageObjects[storageGUI].data[2], 0, 544, 416, 1);
                        break;
                    case "chest":
                        renderItems(element, index, 224, 32, 9);
                        break;
                    case "crafting":
                        if (index <= 24) {
                            renderItems(element, index, 352, 160, 5);
                        } else {
                            renderItems(storageObjects[storageGUI].data[25], 0, 736, 288, 1);
                            renderItems(storageObjects[storageGUI].data[26], 0, 736, 352, 1);
                        };
                        break;
                    case "smelting":
                        renderItems(storageObjects[storageGUI].data[0], 0, 416, 288, 1);
                        renderItems(storageObjects[storageGUI].data[1], 0, 544, 288, 1);
                        renderItems(storageObjects[storageGUI].data[2], 0, 480, 416, 1);
                        renderItems(storageObjects[storageGUI].data[3], 0, 672, 416, 1);
                        renderItems(storageObjects[storageGUI].data[4], 0, 736, 352, 1);
                        renderItems(storageObjects[storageGUI].data[5], 0, 736, 416, 1);
                        break;
                    case 'help':
                        renderItems(element, index, 32, 32, 14);
                        break;
                };
            });
        };
        // drag and drop
        if (drag) {
            pauseRender = false;
            if ((dragItem.type != "") || (dragItem.count != 0)) {
                var sy = Math.floor(dragItem.data / 32);
                var sx = dragItem.data - (sy * 32);
                if (dragItem.type == "block") {
                    ctx.drawImage(blockSheet, sx * 8, sy * 8, 8, 8, cx - 18, cy - 18, 36, 36);
                } else {
                    ctx.drawImage(itemSheet, sx * 32, sy * 32, 32, 32, cx - 24, cy - 24, 48, 48);
                };
                if (dragItem.count > 1) {
                    ctx.fillStyle = "rgb(0,0,0)";
                    ctx.font = "italic small-caps bold 20px arial";
                    ctx.fillText(dragItem.count, cx - 24, cy + 24);
                };
            };
        } else {
            if (storageObjects[storageHoverIndex].type != "drop") {
                var slot;
                switch (storageObjects[storageHoverIndex].type) {
                    case "inventory": slot = (inventoryHoverX + (inventoryHoverY * 9));
                        break;
                    case "hotbar": slot = (inventoryHoverX + (inventoryHoverY * 9));
                        break;
                    case "invcrafting":
                        if (inventoryHoverX == 0) {
                            slot = 0;
                        } else if ((inventoryHoverX == 2) && (inventoryHoverY == 0)) {
                            slot = 1;
                        } else if ((inventoryHoverX == 2) && (inventoryHoverY == 1)) {
                            slot = 2;
                        };
                        break;
                    case "chest": slot = (inventoryHoverX + (inventoryHoverY * 9));
                        break;
                    case "crafting":
                        if (inventoryHoverX < 5) {
                            slot = (inventoryHoverX + (inventoryHoverY * 5));
                        } else if ((inventoryHoverX == 6) && (inventoryHoverY == 2)) {
                            slot = 25;
                        } else if ((inventoryHoverX == 6) && (inventoryHoverY == 3)) {
                            slot = 26;
                        };
                        break;
                    case "smelting":
                        if ((inventoryHoverX == 0) && (inventoryHoverY == 0)) {
                            slot = 0;
                        } else if ((inventoryHoverX == 2) && (inventoryHoverY == 0)) {
                            slot = 1;
                        } else if ((inventoryHoverX == 1) && (inventoryHoverY == 2)) {
                            slot = 2;
                        } else if ((inventoryHoverX == 4) && (inventoryHoverY == 2)) {
                            slot = 3;
                        } else if ((inventoryHoverX == 5) && (inventoryHoverY == 1)) {
                            slot = 4;
                        } else if ((inventoryHoverX == 5) && (inventoryHoverY == 2)) {
                            slot = 5;
                        };
                        break;
                    case 'help': slot = (inventoryHoverX + (inventoryHoverY * 14));
                        break;
                }
                // hover text
                if ((undefined != slot) && (storageObjects[storageHoverIndex].data[slot] != undefined)&&(storageObjects[storageHoverIndex].data[slot].type != "")) {
                    pauseRender = false;
                    if (storageObjects[storageHoverIndex].data[slot].type == "block") {
                        if (null != textNamesBlocks[storageObjects[storageHoverIndex].data[slot].data]) {
                            text(textNamesBlocks[storageObjects[storageHoverIndex].data[slot].data].toString(), cx, cy - 24, 24);
                        };
                    } else {
                        if (null != textNamesItems[storageObjects[storageHoverIndex].data[slot].data]) {
                            text(textNamesItems[storageObjects[storageHoverIndex].data[slot].data].toString(), cx, cy - 24, 24);
                        };
                    };
                } else { pauseRender = true };
            };
        };
    } else {
        pauseRender = false;
        // transparent selection/equipment bar
        ctx.drawImage(gui[1], 0, 84, 80, 24, 192, 832, 640, 192);
        ctx.drawImage(gui[1], 10, 0, 10, 10, (selectionIndex[equipmentIndex] * 64) + 216, 856, 80, 80);
        ctx.drawImage(gui[1], 20, 0, 10, 10, (equipmentIndex * 64) + 216, 920, 80, 80);
        // display hotbar items
        displayHotbarItems();
    };
    // overlays
    if (!inventory) {
        if (underwater) {
            ctx.drawImage(gui[1], 384, 128, 128, 128, 0, 0, cs, cs);
        };
        for (var d = Math.round((100 - playerStats.health) / 20) ; d > 0; d--) {
            ctx.drawImage(gui[1], 384, 0, 128, 128, 0, 0, cs, cs);
        };
    };
    // Console
    if (gameConsole) {
        ctx.drawImage(gui[1], 0, 212, 80, 8, 0, 0, 640, 64);
        text(command, 8, 8, 48);
    };
};
function renderStatus() {
    // health bar
    statctx.drawImage(gui[1], 384, 272, 128, 16, 0, 0, 512, 64);
    renderStatusBar(playerStats.health / 100, 392, 288, 120, 8, 16, 16, 4);
    text('Health ' + Math.round(playerStats.health).toString()+ '/100', 16, 16, 32, 'stat');
    // thirst bar
    statctx.drawImage(gui[1], 384, 272, 128, 16, 0, 64, 512, 64);
    renderStatusBar(playerStats.thirst / 100, 392, 296, 120, 8, 16, 80, 4);
    text('Thirst ' + Math.round(playerStats.thirst).toString() + '/100', 16, 80, 32, 'stat');
    // hunger bar
    statctx.drawImage(gui[1], 384, 272, 128, 16, 0, 128, 512, 64);
    renderStatusBar(playerStats.hunger / 100, 392, 304, 120, 8, 16, 144, 4);
    text('Hunger ' + Math.round(playerStats.hunger).toString() + '/100', 16, 144, 32, 'stat');
    // fatigue bar
    statctx.drawImage(gui[1], 384, 272, 128, 16, 0, 192, 512, 64);
    renderStatusBar(playerStats.fatigue / 100, 392, 312, 120, 8, 16, 208, 4);
    text('Fatigue(sleep) ' + Math.round(playerStats.fatigue).toString() + '/100', 16, 208, 32, 'stat');
    // oxygen bar
    statctx.drawImage(gui[1], 384, 272, 128, 16, 0, 256, 512, 64);
    renderStatusBar(playerStats.oxygen / 100, 392, 320, 120, 8, 16, 272, 4);
    text('Oxygen ' + Math.round(playerStats.oxygen).toString() + '/100', 16, 272, 32, 'stat');
    // space
    statctx.drawImage(gui[1], 384, 256, 128, 16, 0, 320, 512, 64);
    // skills: Woodcutting, Mining, Construction, Crafting, Smithing, Farming, Cooking, Hunting
    statctx.drawImage(gui[1], 384, 272, 128, 16, 0, 384, 512, 64);
    renderSkillBar('Woodcutting ', playerSkills.woodcutting, 392, 328, 120, 8, 16, 400, 4);
    statctx.drawImage(gui[1], 384, 272, 128, 16, 0, 448, 512, 64);
    renderSkillBar('Mining ', playerSkills.mining, 392, 328, 120, 8, 16, 464, 4);
    statctx.drawImage(gui[1], 384, 272, 128, 16, 0, 512, 512, 64);
    renderSkillBar('Construction ', playerSkills.construction, 392, 328, 120, 8, 16, 528, 4);
    statctx.drawImage(gui[1], 384, 272, 128, 16, 0, 576, 512, 64);
    renderSkillBar('Crafting ', playerSkills.crafting, 392, 328, 120, 8, 16, 592, 4);
    statctx.drawImage(gui[1], 384, 272, 128, 16, 0, 640, 512, 64);
    renderSkillBar('Smithing ', playerSkills.smithing, 392, 328, 120, 8, 16, 656, 4);
    statctx.drawImage(gui[1], 384, 272, 128, 16, 0, 704, 512, 64);
    renderSkillBar('Farming ', playerSkills.farming, 392, 328, 120, 8, 16, 720, 4);
    statctx.drawImage(gui[1], 384, 272, 128, 16, 0, 768, 512, 64);
    renderSkillBar('Cooking ', playerSkills.cooking, 392, 328, 120, 8, 16, 784, 4);
    statctx.drawImage(gui[1], 384, 272, 128, 16, 0, 832, 512, 64);
    renderSkillBar('Hunting ', playerSkills.hunting, 392, 328, 120, 8, 16, 848, 4);
    // space
    statctx.drawImage(gui[1], 384, 256, 128, 16, 0, 896, 512, 64);
    // level bar
    statctx.drawImage(gui[1], 384, 272, 128, 16, 0, 960, 512, 64);
    renderSurvivalBar('Survival ', 392, 336, 120, 8, 16, 976, 4);
};
function renderStatusBar(percent, sx, sy, sw, sh, x, y, scale) {
    var width = Math.round(percent * sw);
    if (width > 0) {
        statctx.drawImage(gui[1], sx, sy, Math.round(percent * sw), sh, x, y, Math.round(percent * sw) * scale, sh * scale);
    };
};
function renderSkillBar(string, experience, sx, sy, sw, sh, x, y, scale) {
    var currentLevel = Math.floor((Math.sqrt(100 * (2 * experience + 25)) + 50) / 100);
    var nextLevel = currentLevel + 1;
    var expToCurrent = Math.round(((((currentLevel * currentLevel) + currentLevel) / 2) * 100) - (currentLevel * 100));
    var expToNext = Math.round(((((nextLevel * nextLevel) + nextLevel) / 2) * 100) - (nextLevel * 100));
    if (currentLevel == Infinity) { currentLevel = 0 };
    if (expToNext == Infinity) { expToNext = 0 }; 
    var percent = (experience - expToCurrent) / (expToNext - expToCurrent);
    var width = Math.round(percent * sw);
    if (width > 0) {
        statctx.drawImage(gui[1], sx, sy, width, sh, x, y, width * scale, sh * scale);
    };
    text(string + currentLevel.toString() + ' ' + experience.toString() + '/' + expToNext.toString(), x, y, sh * scale, 'stat');
};
// survival level
function renderSurvivalBar(string, sx, sy, sw, sh, x, y, scale) {
    var experience = playerSkills.woodcutting + playerSkills.mining + playerSkills.construction + playerSkills.crafting + playerSkills.smithing + playerSkills.farming + playerSkills.cooking + playerSkills.hunting;
    var currentLevel = Math.floor((Math.sqrt(100 * (2 * (experience/8) + 25)) + 50) / 100);
    var nextLevel = currentLevel + 1;
    var expToCurrent = Math.round(((((currentLevel * currentLevel) + currentLevel) / 2) * 100) - (currentLevel * 100))*8;
    var expToNext = Math.round(((((nextLevel * nextLevel) + nextLevel) / 2) * 100) - (nextLevel * 100))*8;
    if (currentLevel == Infinity) { currentLevel = 0 };
    if (expToNext == Infinity) { expToNext = 0 };
    var percent = (experience - expToCurrent) / (expToNext - expToCurrent);
    var width = Math.round(percent * sw);
    if (width > 0) {
        statctx.drawImage(gui[1], sx, sy, width, sh, x, y, width * scale, sh * scale);
    };
    text(string + currentLevel.toString() + ' ' + experience.toString() + '/' + expToNext.toString(), x, y, sh * scale, 'stat');
};
function renderLayer1() {
    //var texture = new Image();
    var blockType = layer1[index(x, y)];
    if (blockType > 0) {
        switch (blockType) {
            case 5: ctx.fillStyle = "rgba(0,0,0,0.2)"; break;
            case 26: ctx.fillStyle = "rgba(0,0,0,0.2)"; break;
            default: ctx.fillStyle = "rgba(0,0,0,0.6)"; break;
        };
        var sy = Math.floor(blockType / 32);
        var sx = blockType - (sy * 32);
        ctx.drawImage(blockSheet, sx * 8, sy * 8, 8, 8, Math.round(((x - topLeft().x) * csDivVs) - halfCsDivVs), Math.round(((y - topLeft().y) * csDivVs) - halfCsDivVs), csDivVs, csDivVs);
        ctx.fillRect(Math.round(((x - topLeft().x) * csDivVs) - halfCsDivVs), Math.round(((y - topLeft().y) * csDivVs) - halfCsDivVs), csDivVs, csDivVs);
    };
};
// get the exact top left game coordinate of the view
function topLeft() {
    return {
        x: (px-vsDiv2),
        y: (py-vsDiv2)
    };
};
// player body actions
var plrBodyUpdate;
var plrBodyx = 0;
var plrBodyy = 0;
// player arm actions
function armAnim() {
    plrArmAction = true;
    if (plrBodyy == 0) {
        plrArmRot = (Math.PI * (5 / 4));
    } else if (plrBodyy == 1) {
        plrArmRot = -(Math.PI * (5 / 4));
    };
    plrArmUpdate = setInterval(function () {
        if (plrBodyy == 0) {
            if (plrArmRot <= (Math.PI * (1 / 4))) {
                plrArmRot = (Math.PI * (5 / 4));
            } else if (plrArmRot <= (Math.PI * (5 / 4))) {
                plrArmRot -= Math.PI / 16;
            };
        } else if (plrBodyy == 1) {
            if (plrArmRot >= (-Math.PI * (1 / 4))) {
                plrArmRot = (-Math.PI * (5 / 4));
            } else if (plrArmRot >= (-Math.PI * (5 / 4))) {
                plrArmRot += Math.PI / 16;
            };
        };
    }, 25);
};
var plrArmUpdate;
var plrArmx = 4;
var plrArmy = 0;
var plrArmRot = 0;
var player = new Image();
player.src = "textures/player.png";
// gui
var inventory = false;
function displayHotbarItems() {
    storageObjects[2].data.forEach(function (element, index, array) {
        if ((index >= equipmentIndex * 9) && (index < (9 + (equipmentIndex * 9))) && (element.type != "")) {
            var sy = Math.floor(element.data / 32);
            var sx = element.data - (sy * 32);
            var y = Math.floor(index / 9);
            var x = index - (y * 9);
            if (element.type == "block") {
                ctx.drawImage(blockSheet, sx * 8, sy * 8, 8, 8, (x * 64) + 238, 878, 36, 36);
            } else {
                ctx.drawImage(itemSheet, sx * 32, sy * 32, 32, 32, (x * 64) + 232, 872, 48, 48);
            };
            if (element.count == 0) {
                ctx.fillStyle = "rgba(0,0,0,0.5)";
                ctx.fillRect((x * 64) + 224, 864, 64, 64);
            };
        };
    });
    storageObjects[2].data.forEach(function (element, index, array) {
        if (element.type != "") {
            var first = [0, 9, 18, 27, 36, 45, 54, 63, 72, 81];
            if (first.indexOf(index) != -1) {
                var sy = Math.floor(element.data / 32);
                var sx = element.data - (sy * 32);
                if (element.type == "block") {
                    ctx.drawImage(blockSheet, sx * 8, sy * 8, 8, 8, (first.indexOf(index)*64) + 238, 942, 36, 36);
                } else {
                    ctx.drawImage(itemSheet, sx * 32, sy * 32, 32, 32, (first.indexOf(index)*64) + 232, 936, 48, 48);
                };
            };
        };
    });
};
function renderItems(element, index,xOffset,yOffset,storageWidth) {
    if ((element.type != "") || (element.count != 0)) {
        var sy = Math.floor(element.data / 32);
        var sx = element.data - (sy * 32);
        var y = Math.floor(index / storageWidth);
        var x = index - (y * storageWidth);
        if (element.type == "block") {
            ctx.drawImage(blockSheet, sx * 8, sy * 8, 8, 8, (x * 64) + xOffset+14, (y * 64) + yOffset + 14, 36, 36);
        } else {
            ctx.drawImage(itemSheet, sx * 32, sy * 32, 32, 32, (x * 64) + xOffset+8, (y * 64) + yOffset+8, 48, 48);
        };
        if (element.count > 1) {
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.font = "italic small-caps bold 20px arial";
            ctx.fillText(element.count, (x * 64) + xOffset+8, (y * 64) + yOffset + 56);
        };
    };
};
// block cracks
var blockCrackX= 0;
var blockCrackY = 5;

//--------
// Physics
//--------

var saplings = [];
// a regular update that occors less than 60 times/s
var waterCounter = 0;
function clockUpdate() {
    updateSmeltingOperations();
    renderStatus();
    // health
    if (playerStats.health < 100) {     
        if (playerStats.health <= 0) {
            playerStats.health = 0;
        };
        if ((playerStats.hunger > 0) && (playerStats.thirst > 0) && (playerStats.fatigue > 0) && (playerStats.oxygen > 0) && (playerStats.health > 0)) {
            playerStats.health += 0.1;
        };
    } else if (playerStats.health > 100) { playerStats.health = 100; };
    if (playerStats.health <= 0) {
        pausePhysics = true;
        pauseRender = true;
        menu = 5;
        updateMenu();
        stopAnimLoop = true;
        clearInterval(plrArmUpdate);
        clearInterval(blockCrackUpdate);
        clearInterval(blockMineUpdate);
    };
    // oxygen
    if ([0,27,28,46,47,48,49,50,51].concat(noCollide).indexOf(testfor(0, -0.5)) == -1) {
        if (playerStats.oxygen > 0) {
            playerStats.oxygen -= 0.3;
        };
        underwater = true;
    } else {
        if (playerStats.oxygen < 100) {
            playerStats.oxygen += 0.16;
        };
        underwater = false;
    };
    if (playerStats.oxygen <= 0) {
        playerStats.oxygen = 0;
        playerStats.health -= 0.2;
    } else if (playerStats.oxygen > 100) {
        playerStats.oxygen = 100;
    };
    // thirst
    if (playerStats.thirst > 0) {
        playerStats.thirst -= 0.016;
    } else if (playerStats.thirst <= 0) {
        playerStats.thirst = 0;
        playerStats.health -= 0.1;
    };
    // hunger
    if (playerStats.hunger > 0) {
        playerStats.hunger -= 0.008;
    } else if (playerStats.hunger <= 0) {
        playerStats.hunger = 0;
        playerStats.health -= 0.1;
    };
    // fatigue
    if (playerStats.fatigue > 0) {
        playerStats.fatigue -= 0.008;
    } else if (playerStats.fatigue <= 0) {
        playerStats.fatigue = 0;
        playerStats.health -= 0.1;
    };
    // water physics
    waterCounter++;
    if (waterCounter == 5) {
        for (var iY = Math.round(py - 8) ; iY <= Math.round(py + 8) ; iY++) {
            for (var iX = Math.round(px - 8) ; iX <= Math.round(px + 8) ; iX++) {
                if (layer0[index(iX, iY)] == 22) {
                    if (layer0[index(iX, iY + 1)] == 0) {
                        layer0[index(iX, iY + 1)] = 22;
                    } else if (layer0[index(iX - 1, iY)] == 0) {
                        layer0[index(iX - 1, iY)] = 22;
                    } else if (layer0[index(iX + 1, iY)] == 0) {
                        layer0[index(iX + 1, iY)] = 22;
                    };
                };
            };
        };
        waterCounter = 0;
    };
    // climb ladder
    if ((([35, 36].indexOf(testfor(0, -0.7)) != -1) || ([35, 36].indexOf(testfor(0, 0.5)) != -1)) && keyMap[87]) {
        pyvel = -5;
    };
    // saplings grow
    saplings.forEach(function (sapling, Index) {
        if (probability(3000)) {
            var tempLayers = tree({ layer0: layer0, layer1: layer1 }, 'Elm', sapling.x, sapling.y, 6, 20, 0.9, 0.6);
            layer0 = tempLayers.layer0;
            layer1 = tempLayers.layer1;
            layer0[index(sapling.x, sapling.y)] = 0;
            // remove sapling refrence from saplings
            saplings.splice(Index, 1);
            // experience
            playerSkills.farming += 3;
        };
    });
    // saplings have dirt under them
    saplings.forEach(function (sapling, Index) {
        if (blockTypeDirt.indexOf(textNamesBlocks[layer0[index(sapling.x, sapling.y + 1)]]) == -1) {
            var type = layer0[index(sapling.x, sapling.y)];
            layer0[index(sapling.x, sapling.y)] = 0;
            entityItems.push(new entity("block", type, relToAbs(sectorX, sectorY, sapling.x + (0.25 - (Math.random() / 2)), sapling.y), 0, -2, 0, 0, g));
            saplings.splice(Index, 1);
        };
    });
};
// sector coordinates
var lastSector = [0,0];
// collision
var up = true;
var down = true;
var left = true;
var right = true;
// player velocity
var pxvel = 0;
var pyvel = 0;
// player accelerations
var pxacc = 0;
var pyacc = 0;
var pxMaxVel = 5;
var pyMaxVel = 78;
// player frictions
var pxfr = 30;
var pyfr = 0;
// player gravity
var g = 32;
// entity constructor
function entity(type, data, coordinate, xVelocity, yVelocity, xAcceleration, yAcceleration, gravity) {
    this.type = type;
    this.data = data;
    this.coord = coordinate;
    this.xvel = xVelocity;
    this.yvel = yVelocity;
    this.xacc = xAcceleration;
    this.yacc = yAcceleration;
    this.g = gravity;
    this.update = function (type, data, coord, xvel, yvel, xacc, yacc, gravity) {
        if (entityCollide(this.coord[0], this.coord[1], 0.5, 0.5)) {
            this.coord[1] += (yvel * t) + (((yacc + gravity) / 2) * (t * t));
            this.yvel = ((yvel * t) + (((yacc + gravity) / 2) * (t * t))) / t;
        } else {
            this.coord[1] += 0;
            this.yvel = 0;
        };
    };
};
// entity physics
var entityItems = [];
// master movement function, includes x and y velocities, accelerations, absolute frictional constants, gravity, and time
function playerPhysics(xvel, yvel, xacc, yacc, absxfr, absyfr, gravity) {
    var xfr;
    var yfr;
    var xf=0;
    var yf = 0;
    collide();
    // x
    //if (!left) { worldPx = Math.round(worldPx) - 0.3};
    //if (!right) { worldPx = Math.round(worldPx) + 0.3};
    if (xvel <= 0) { xfr = absxfr; } else if (xvel > 0) { xfr = (absxfr / -1); };
    if ((xacc == 0) && (xvel != 0)) {
        xf = (xvel * t) + ((xfr / 2) * (t * t));
        if ((-0.01<xf)&&(xf<0.01)) { xf = 0 };
    } else {
        xf = (xvel * t) + ((xacc / 2) * (t * t));
    };
    if ((right || (!right && (xacc < 0))) && (left || (!left && (xf > 0)))) {
        worldPx += xf;
        pxvel = (xf / t);
        if (keyMap[65] && (pxvel > -2)) { pxvel = -2 };
        if (keyMap[68] && (pxvel < 2)) { pxvel = 2 };
        if (pxvel > pxMaxVel) { pxvel = pxMaxVel };
        if (pxvel < -pxMaxVel) { pxvel = -pxMaxVel };
    };
    sectorX = Math.floor(worldPx / 255);
    px = worldPx - (sectorX * 255);
    // y
    if (yvel < 0) { yfr = (absyfr / -1); } else if (yvel >= 0) { yfr = absyfr; };
    if (!down) {
        if (yvel > 12) {
            playerStats.health -= yvel * 3.5;
        };
        gravity = 0;
        allowJump = true;
    } else if (down) { allowJump = false };
    if ((yacc == 0) && (yvel != 0)) {
        yf = (yvel * t) + (((yfr + gravity) / 2) * (t * t));
    } else {
        yf = (yvel * t) + (((yacc + gravity) / 2) * (t * t));
    };
    if ((down || (!down && (yf < 0))) && (up || (!up && (yf > 0)))) {
        worldPy += yf;
        pyvel = (yf / t);
        if (pyvel > pyMaxVel) { pyvel = pyMaxVel };
        if (pyvel < -pyMaxVel) { pyvel = -pyMaxVel };
    };
    sectorY = Math.floor(worldPy / 256);
    py = worldPy - (sectorY * 256);
    // jumping
    if ([22].indexOf(layer0[index(Math.round(px), Math.round(py))]) != -1) {
        if (keyMap[32]) {
            pyacc = -40;
        };
    } else {
        if (keyMap[32] && allowJump) {
            pyvel = -5.8;
        };
        pyacc = 0;
    };
    if (!keyMap[32]) {
        pyacc = 0;
    };
    // check for new sector
    var currentSector = [sectorX, sectorY];
    if (currentSector[0] != lastSector[0]) {
        saveSector();
        lastSector = currentSector;
        // create new sector if necessary
        var test = true;
        world.some(function (element, index) {
            if (element.coord == sectorX) {
                test = false;
                return true;
            };
        });
        if (test) {
            world.push(new constructSector(sectorX, sectorY, 0));
        };
        loadSector();
    };
};
// finds the block type relative to player coordinates
function testfor(xoffset, yoffset) {
    return layer0[index(Math.round(px + xoffset), Math.round(py + yoffset))];
};
// finds the block type relative to the entity's coordinates
function entityTestFor(x, y, xoffset, yoffset) {
    var coord = absToRel(x, y);
    return layer0[index(Math.round(coord[0] + xoffset), Math.round(coord[1] + yoffset))];
};
// player's collision detection
var fluids = [0, 22];
var noCollide = [29, 30, 31, 32, 35, 36,53];
var allNoCollisions = fluids.concat(noCollide);
var unCollide = { left: true, right: true, up: true, down: true };
function collide() {
    var sumCollide = { left: false, right: false, up: false, down: false };
    for (y = Math.round(py - 1) ; y < Math.round(py + 2) ; y++) {
        for (x = Math.round(px - 1) ; x < Math.round(px + 1.5) ; x++) {           
            if (allNoCollisions.indexOf(layer0[index(x, y)]) == -1) {
                if ([37, 39, 41, 43, 45].indexOf(layer0[index(x, y)]) != -1) {
                    var collisionBox = 1;
                } else if ([38, 40, 42, 44, 46].indexOf(layer0[index(x, y)]) != -1) {
                    var collisionBox = 2;
                } else if ([47, 48, 49, 50, 51].indexOf(layer0[index(x, y)]) != -1) {
                    var collisionBox = 3;
                } else if ([27, 28].indexOf(layer0[index(x, y)]) != -1) {
                    var collisionBox = 4;
                } else {
                    var collisionBox = 0;
                };
                var HorizontalResult = collision({ x: px - 0.2, y: py - 0.69, width: 0.4, height: 1.68 }, collisionBox, x - 0.5, y - 0.5);
                var VerticalResult = collision({ x: px - 0.15, y: py - 0.75, width: 0.3, height: 1.8 }, collisionBox, x - 0.5, y - 0.5);
                //worldPy += Horizontal.stepUp;
                if (HorizontalResult.detect.left) {
                    if (unCollide.left) {
                        left = false; pxvel = 0; worldPx += HorizontalResult.displace.x - 0.05;
                        unCollide.left = false;
                        sumCollide.left = true;
                    } else {
                        left = false;
                    };
                } else if (HorizontalResult.detect.right) {
                    if (unCollide.right) {
                        right = false; pxvel = 0; worldPx += HorizontalResult.displace.x + 0.05;
                        unCollide.right = false;
                        sumCollide.right = true;
                    } else {
                        right = false;
                    };
                } else if (VerticalResult.detect.top) {
                    if (unCollide.up) {
                        up = false; pyvel = 0; worldPy += VerticalResult.displace.y - 0.05;
                        unCollide.up = false;
                        sumCollide.up = true;
                    } else {
                        up = false;
                    };
                } else if (VerticalResult.detect.bottom) {
                    if (unCollide.down) {
                        down = false; pyvel = 0; worldPy += VerticalResult.displace.y + 0.05;
                        unCollide.down = false;
                        sumCollide.down = true;
                    } else {
                        down = false;
                    };
                };
            };
        };
    };
    if (!sumCollide.left) {
        left = true;
        unCollide.left = true;
    };
    if (!sumCollide.right) {
        right = true;
        unCollide.right = true;
    };
    if (!sumCollide.up) {
        up = true;
        unCollide.up = true;
    };
    if (!sumCollide.down) {
        down = true;
        unCollide.down = true;
    };
};
// partial collisions
/*
,
    { type: '', data: [{type: '',x:0,y:0,width:0,height:0}]}
*/
var collisionBoxes = [
    { type:'solid', data: [{type: 'rectangle', x:0,y:0,width:1,height:1}]},
    { type: 'leftStair', data: [{ type: 'rectangle', x: 0, y: 0, width: 0.25, height: 1 }, { type: 'rectangle', x: 0.25, y: 0.25, width: 0.25, height: 0.75 }, { type: 'rectangle', x: 0.5, y: 0.5, width: 0.25, height: 0.5 }, { type: 'rectangle', x: 0.75, y: 0.75, width: 0.25, height: 0.25 }] },
    { type: 'rightStair', data: [{ type: 'rectangle', x: 0.74, y: 0, width: 0.25, height: 1 }, { type: 'rectangle', x: 0.5, y: 0.25, width: 0.25, height: 0.75 }, { type: 'rectangle', x: 0.25, y: 0.5, width: 0.25, height: 0.5 }, { type: 'rectangle', x: 0, y: 0.75, width: 0.25, height: 0.25 }] },
    { type: 'slab', data: [{ type: 'rectangle', x: 0, y: 0.75, width: 1, height: 0.25 }] },
    { type: 'door', data: [{ type: 'rectangle', x: 0.75, y: 0, width: 0.25, height: 1 }] }
];
// parameter entityCollisionBox = {x:,y:,width:,height:};
// parameter collisionBox = an index value of CollisionBoxes
function collision(entityCollisionBox, collisionBox,boxX,boxY) {
    var detect = { left: false, right: false, top: false, bottom: false };
    var displace = { x: 0, y: 0 };
    var stepUp = 0;
    collisionBoxes[collisionBox].data.forEach(function (component) {
        switch (component.type) {
            case 'rectangle':
                var entityXplusWidth = entityCollisionBox.x + entityCollisionBox.width;
                var entityYplusHeight = entityCollisionBox.y + entityCollisionBox.height;
                var componentXplusWidth = (component.x+boxX) + component.width;
                var componentYplusHeight = (component.y + boxY) + component.height;
                if (((component.x + boxX) < entityXplusWidth )&& (componentXplusWidth > entityCollisionBox.x)
                    && ((component.y + boxY) < entityYplusHeight) && (componentYplusHeight > entityCollisionBox.y)) {
                    if (entityCollisionBox.x + (entityCollisionBox.width / 2) >= (component.x + boxX) + (component.width / 2)) {
                        // left collision
                        var width = componentXplusWidth - entityCollisionBox.x;
                        detect.left = true;
                    } else if (entityCollisionBox.x + (entityCollisionBox.width / 2) <= (component.x + boxX) + (component.width / 2)) {
                        // right collision
                        var width = entityXplusWidth - (component.x + boxX);
                        detect.right = true;
                    };
                    if (entityCollisionBox.y + (entityCollisionBox.height / 2) >= (component.y + boxY) + (component.height / 2)) {
                        // top collision
                        var height = componentYplusHeight - entityCollisionBox.y;
                        detect.top = true;
                    } else if (entityCollisionBox.y + (entityCollisionBox.height / 2) <= (component.y + boxY) + (component.height / 2)) {
                        // bottom collision
                        var height = entityYplusHeight - (component.y+boxY);
                        detect.bottom = true;
                    };
                    if (width > height) {
                        detect.left = false;
                        detect.right = false;
                    } else {
                        detect.top = false;
                        detect.bottom = false;
                    };
                    if (detect.left) {
                        displace.x = width;
                    } else if (detect.right) {
                        displace.x = -width;
                    } else if (detect.top) {
                        displace.y = height;
                    } else {
                        displace.y = -height;
                    };
                    //if (entityYplusHeight - (component.y + boxY) <= 0.25) {
                    //    stepUp = -(entityYplusHeight - (component.y + boxY));
                    //};
                };
                break;
        };
    });
    return { displace: displace, detect: detect,stepUp: stepUp };
};
// entity collision detection
function entityCollide(x,y,width, height) {
    // bottom
    return !((allNoCollisions.indexOf(entityTestFor(x, y, -width / 2, height / 2)) == -1) || (allNoCollisions.indexOf(entityTestFor(x, y, width / 2, height / 2)) == -1));
};

//----------
// The World
//----------

// minVeins & maxVeins detemine how many veins are in a sector, minY & maxY determine elevations, a = width of the vein, b = height
var veins = [
    { data: 15, minVeins: 40, maxVeins: 80, minY: 96, maxY: 160, a: 3, b: 1.5 },
    { data: 16, minVeins: 40, maxVeins: 70, minY: 128, maxY: 192, a: 3, b: 1.5 },
    { data: 17, minVeins: 40, maxVeins: 70, minY: 128, maxY: 256, a: 3, b: 1.5 },
    { data: 18, minVeins: 3, maxVeins: 6, minY: 64, maxY: 80, a: 2, b: 5 },
    { data: 18, minVeins: 3, maxVeins: 6, minY: 184, maxY: 200, a: 1, b: 5 },
    { data: 19, minVeins: 40, maxVeins: 60, minY: 96, maxY: 160, a: 10, b: 1.5 },
    { data: 20, minVeins: 5, maxVeins: 7, minY: 192, maxY: 256, a: 2, b: 2 },
    { data: 21, minVeins: 20, maxVeins: 70, minY: 128, maxY: 256, a: 3, b: 2 },
    { data: 4, minVeins: 70, maxVeins: 90, minY: 100, maxY: 192, a: 5, b: 3 },
    { data: 23, minVeins: 70, maxVeins: 90, minY: 100, maxY: 192, a: 5, b: 3 },
    { data: 12, minVeins: 40, maxVeins: 60, minY: 100, maxY: 192, a: 5, b: 3 },
    { data: 33, minVeins: 10, maxVeins: 20, minY: 160, maxY: 256, a: 3, b: 1.5 },
    { data: 34, minVeins: 10, maxVeins: 20, minY: 160, maxY: 256, a: 3, b: 1.5 }
];
// generate full terrain with trees and structures ect.
function generator(roughness, middle) {
    var tempLayers = { layer0: newFilledArray(65536, 0), layer1: newFilledArray(65536, 0) };
    // get the points
    surface = terrain(ww, wh, wh / 4, roughness, middle);
    // draw the points
    for (var t = 1; t < surface.length; t++) {
        var topsoil;
        if (Math.round(surface[t]) >= 134) { topsoil = 23; } else { topsoil = 3 };
        tempLayers.layer0.splice(index(t, Math.round(surface[t])), 1, topsoil);
        tempLayers.layer1.splice(index(t, Math.round(surface[t])), 1, topsoil);
        if (topsoil == 3) { topsoil = 2; };
        for (var dirt = 1; dirt < 5; dirt++) {
            tempLayers.layer0.splice(index(t, Math.round(surface[t]) + dirt), 1, topsoil);
            tempLayers.layer1.splice(index(t, Math.round(surface[t]) + dirt), 1, topsoil);
        };
        var stone = 1;
        y = Math.round(surface[t]) + 4 + stone;
        while (y <= wh) {
            tempLayers.layer0.splice(index(t, y), 1, 1);
            tempLayers.layer1.splice(index(t, y), 1, 1);
            if (y == wh) {
                tempLayers.layer0[index(t, y)] = 52;
                tempLayers.layer1[index(t, y)] = 52;
            };
            stone++;
            y = Math.round(surface[t]) + 4 + stone;
        };
    };
    // veins
    veins.forEach(function (element) {
        for (var i = (Math.random() * (element.maxVeins - element.minVeins)) + element.minVeins; i > 0; i--) {
            var xOffset = Math.round(Math.random() * 256);
            var yOffset = Math.round((Math.random() * (element.maxY - element.minY)) + element.minY);
            var aSqrd = element.a * element.a;
            var bSqrd = element.b * element.b;
            for (y = yOffset - element.b; y < (yOffset + element.b) ; y++) {
                for (x = xOffset - element.a; x < (xOffset + element.a) ; x++) {
                    if (((((x - xOffset) * (x - xOffset)) / aSqrd) + (((y - yOffset) * (y - yOffset)) / bSqrd)) <= 1) {
                        switch (element.data) {
                            case 4:
                                if ((tempLayers.layer0[index(x, y)] == 23) || (tempLayers.layer0[index(x, y)] == 2)||(tempLayers.layer0[index(x, y)] == 3)) {
                                    tempLayers.layer0.splice(index(x, y), 1, element.data);
                                    tempLayers.layer1.splice(index(x, y), 1, element.data);
                                };
                                break;
                            case 12:
                                if ((tempLayers.layer0[index(x, y)] == 23) || (tempLayers.layer0[index(x, y)] == 2)||(tempLayers.layer0[index(x, y)] == 3)) {
                                    tempLayers.layer0.splice(index(x, y), 1, element.data);
                                    tempLayers.layer1.splice(index(x, y), 1, element.data);
                                };
                                break;
                            case 23:
                                if ((tempLayers.layer0[index(x, y)] == 23) || (tempLayers.layer0[index(x, y)] == 2) || (tempLayers.layer0[index(x, y)] == 3)) {
                                    tempLayers.layer0.splice(index(x, y), 1, element.data);
                                    tempLayers.layer1.splice(index(x, y), 1, element.data);
                                };
                                break;
                            default:
                                if ((tempLayers.layer0[index(x, y)] != 0) && (tempLayers.layer0[index(x, y)] == 1)) {
                                    tempLayers.layer0.splice(index(x, y), 1, element.data);
                                };
                                break;
                        };
                    };
                };
            };
        };
    });
    // water
    for (var a = 1; a <= ww; a++) {
        var water = 136;
        while (tempLayers.layer0[index(a, water)] == 0) {
            tempLayers.layer0.splice(index(a, water), 1, 22);
            tempLayers.layer1.splice(index(a, water), 1, 23);
            water++;
        };
    };
    // caves
    tempLayers.layer0 = caves(tempLayers.layer0, Math.PI / 2, 5, 2, 7, 10, 20, 1.5, 2.5);
    // trees
    x = 0;
    while (x <= ww) {
        x += Math.round((Math.random() * (12 - 4)) + 4);
        y = Math.round(surface[x]);
        tempLayers = tree(tempLayers, 'Elm', x, y, 6, 20, 0.9, 0.6);
    };
    return tempLayers;
};
// create surface points
function terrain(width, height, displace, roughness, middle) {
    var points = [];
        // Gives a power of 2 based on width
	
	//var power = Math.ceil(Math.log(width) / (Math.log(2)));
	//power = power * power;
    var power = Math.pow(2, Math.ceil(Math.log(width) / (Math.log(2))));

    // Set the initial left point
    points[0] = height / 2;
    // set the initial right point
    points[power] = height / 2;
    displace *= roughness;
    
    // Increase the number of segments
    for (var i = 1; i < power; i *= 2) {
        // Iterate through each segment calculating the center point
        // set the middle point, if necessary
        if ((i == 1) && (middle != 0)) {
            points[128] = middle;
        } else {
            for (var j = (power / i) / 2; j < power; j += power / i) {
                points[j] = ((points[j - (power / i) / 2] + points[j + (power / i) / 2]) / 2);
                points[j] += (Math.random() * displace * 2) - displace
            };
        };
        // reduce the random range
        displace *= roughness;
    };
    return points;
};
var leafWidth;
var leafy;
var leafx;
var height;
function tree(tempLayers, type, baseX, baseY, heightMin, heightMax, widthDivHeight, percentLeaves) {
    var layer0 = tempLayers.layer0;
    var layer1 = tempLayers.layer1;
    var leaves = textNamesBlocks.indexOf(type + ' ' + 'Leaves');
    var wood = textNamesBlocks.indexOf(type + ' ' + 'Log');
    // trunk
    height = (Math.round((Math.random() * (heightMax - heightMin)) + heightMin));
    for (var h = 0; h <= height; h++) {
        layer1[index(baseX, baseY - h)] = wood;
    };
    // ellipse leaves
    var b = (percentLeaves * height) / 2;
    var a = b*widthDivHeight;
    var xOffset = Math.round(baseX);
    var yOffset = Math.round((baseY - height) + b)-1;
    var aSqrd = a*a;
    var bSqrd = b*b;
    for (var iY = Math.round(yOffset - b); iY < yOffset + b ; iY++) {
        for (var iX = Math.round(xOffset - a); iX < xOffset + a ; iX++) {
            if (((((iX - xOffset) * (iX - xOffset)) / aSqrd) + (((iY - yOffset) * (iY - yOffset)) / bSqrd)) <= 1) {
                layer0[index(iX, iY)] = leaves;
            };
        };
    };
    return { layer0: layer0, layer1: layer1 };
};
function caves(temp0, roughness, maxCount, minCount, resolution, minLength, maxLength, minRadius, maxRadius) {
    var layer0 = temp0;
    for (var seed = (Math.random() * (maxCount - minCount)) + minCount; seed > 0; seed--) {
        var randX = Math.round(Math.random() * 256);
        var pointOne = { x: randX, y: Math.round(surface[randX]-resolution) };
        var pointTwo = { x: randX, y: Math.round(surface[randX]) };
        var angle;
        var opposite;
        var adjacent;
        for (var segment = (Math.random() * (maxLength - minLength)) + minLength; segment > 0; segment--) {
            var radius = (Math.random()*(maxRadius-minRadius)) + minRadius;
            opposite = pointTwo.y - pointOne.y;
            adjacent = pointTwo.x - pointOne.x;
            angle = Math.atan(opposite / adjacent);
            if (adjacent == 0) {
                if (opposite < 0) {
                    angle = -(Math.PI / 2);
                } else if (opposite > 0) {
                    angle = Math.PI / 2;
                };
            } else if (adjacent < 0) {
                if (opposite < 0) {
                    angle = -((((Math.PI / 2) - Math.abs(angle)) * 2) + Math.abs(angle));
                } else if (opposite > 0) {
                    angle = ((((Math.PI / 2) - Math.abs(angle)) * 2) + Math.abs(angle));
                } else {
                    angle = Math.PI;
                };
            };
            angle = angle + (Math.random() * roughness) - (roughness / 2);
            // switch and move points for the new segment
            pointOne.x = pointTwo.x;
            pointOne.y = pointTwo.y;
            pointTwo.x = Math.round((Math.cos(angle) * resolution)+pointOne.x);
            pointTwo.y = Math.round((Math.sin(angle) * resolution)+pointOne.y);
            // fill in segment by graphing circles on the line
            for (var circleTest = 0; circleTest < resolution; circleTest++) {
                var testX = Math.round((Math.cos(angle) * circleTest)+pointOne.x);
                var testY = Math.round((Math.sin(angle) * circleTest)+pointOne.y);
                for (var iY = testY - radius; iY < testY + radius; iY++) {
                    for (var iX = testX - radius; iX < testX + radius; iX++) {
                        var width = iX - testX;
                        var height = iY - testY;
                        if (((width * width) + (height * height)) <= (radius * radius)) {
                            var block = index(Math.round(iX), Math.round(iY));
                            if (layer0[block] != 22) {
                                if (Math.round(iY) >= 192) {
                                    layer0[block] = 22;
                                } else {
                                    layer0[block] = 0;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
    return temp0;
};
// world Sector constructor
function constructSector(x, y, middle) {
    this.coord = x;
    var sector = generator(0.3+((userRoughness/10)*0.5),middle);
    this.layer0 = sector.layer0;
    this.layer1 = sector.layer1;
    this.entityItems = [];
};
// set layer0, and layer1 globals to given sector
function loadSector() {
    world.some(function (element, index) {
        if (element.coord == sectorX) {
            layer0 = element.layer0;
            layer1 = element.layer1;
            entityItems = element.entityItems;
            return true;
        };
    });
};
// set given sector to layer0, and layer1 globals
function saveSector() {
    world.some(function (element, index) {
        if (element.coord == lastSector[0]) {
            element.layer0 = layer0;
            element.layer1 = layer1;
            element.entityItems = entityItems;
            return true;
        };
    });
}

//-----------
// In Game UI
//-----------

// controls
var keyMap = newFilledArray(100, false);
var mouseMap = newFilledArray(10, false);
var mineability = true;
var lastIndex;
var mineLayer = 0;
var lastMineLayer;
// console
var gameConsole = false;
var command = '';
// drops the item type, data, and a random quantity between 0 and count, chance is the probability that it will drop anything
function dropRandom(type, data, count, chance) {
    if (probability(chance)||chance == undefined) {
        for (var random = Math.floor((Math.random() * count) + 0.5) ; random > 0; random--) {
            entityItems.push(new entity(type, data, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, -2, 0, 0, g));
        };
    };
};
function mining() {
    if (!inventory && mineability && (Math.sqrt((Math.abs(cx - 512) * Math.abs(cx - 512)) + (Math.abs(cy - 512) * Math.abs(cy - 512))) < (csDivVs * 4)) &&
        (((mineLayer == 0) && !((layer0[index(Math.round(mouse().x), Math.round(mouse().y))] == 0) || (layer0[index(Math.round(mouse().x), Math.round(mouse().y))] == 22) || (layer0[index(Math.round(mouse().x), Math.round(mouse().y))] == 52))) || ((mineLayer == 1) && (layer1[index(Math.round(mouse().x), Math.round(mouse().y))] != 0)))) {
        // sprite animation
        armAnim();
        // audio
        // determine mining time
        var selectedBlock;
        if (mineLayer == 0) {
            selectedBlock = layer0[index(Math.round(mouse().x), Math.round(mouse().y))];
        } else if (mineLayer == 1) {
            selectedBlock = layer1[index(Math.round(mouse().x), Math.round(mouse().y))];
        };
        lastIndex = (Math.round(mouse().x) + (Math.round(mouse().y) * ww));
        lastMineLayer = mineLayer;
        var toolType;
        var toolSpeedBonus;
        if (equippedItem.type == "tool") {
            tools.some(function (element, index) {
                if (element.indexOf(equippedItem.data) != -1) {
                    toolType = index;
                    toolSpeedBonus = 1 / (1 + element.indexOf(equippedItem.data));                    
                    return true;
                };
            });
        };
        var correctToolType = true;
        switch (toolType) {
            case 0: if (blockTypeStone.indexOf(textNamesBlocks[selectedBlock]) != -1) {
                toolSpeed = blockDurabilty[textNamesBlocks[selectedBlock]] * toolSpeedBonus;
            } else {
                toolSpeed = blockDurabilty[textNamesBlocks[selectedBlock]] * 1;
                correctToolType = false;
            }; break;
            case 1: if (blockTypeDirt.indexOf(textNamesBlocks[selectedBlock]) != -1) {
                toolSpeed = blockDurabilty[textNamesBlocks[selectedBlock]] * toolSpeedBonus;
            } else {
                toolSpeed = blockDurabilty[textNamesBlocks[selectedBlock]] * 1;
                correctToolType = false;
            }; break;
            case 2: if (blockTypeWood.indexOf(textNamesBlocks[selectedBlock]) != -1) {
                toolSpeed = blockDurabilty[textNamesBlocks[selectedBlock]] * toolSpeedBonus;
            } else {
                toolSpeed = blockDurabilty[textNamesBlocks[selectedBlock]] * 1;
                correctToolType = false;
            }; break;
            default: toolSpeed = blockDurabilty[textNamesBlocks[selectedBlock]] * 1; 
                correctToolType = false;
                break;
        };
        if (compareTDC(equippedItem, { type: 'tool', data: 64, count: 0 })) {
            toolSpeed = 0;
        };
        blockCrackX = 0;
        // breaking the block
        blockCrackUpdate = setInterval(function () {
            blockCrackX++;
            if (blockCrackX > 7) {
                if (mineLayer == 0) {
                    layer0.splice(index(Math.round(mouse().x), Math.round(mouse().y)), 1, 0);
                } else if (mineLayer == 1) {
                    layer1.splice(index(Math.round(mouse().x), Math.round(mouse().y)), 1, 0);
                };
                // block drops
                    tools.some(function (element) {
                        if (!blockTier.hasOwnProperty(textNamesBlocks[selectedBlock])||((element.indexOf(equippedItem.data) >= blockTier[textNamesBlocks[selectedBlock]])&&correctToolType)) {
                            switch (selectedBlock) {
                                case 1:
                                    entityItems.push(new entity("block", 9, relToAbs(sectorX,sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, -2, 0, 0, g));
                                    break;
                                case 5:
                                    entityItems.push(new entity("block", 5, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, -2, 0, 0, g));
                                    var log = Math.round(mouse().y)-1;
                                    while (layer1[index(Math.round(mouse().x), log)] == 5) {
                                        layer1[index(Math.round(mouse().x), log)] = 0;
                                        layer0[index(Math.round(mouse().x), log)] = 0;
                                        entityItems.push(new entity("block", 5, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), log), 0, -2, 0, 0, g));
                                        log--
                                    };
                                    break;
                                case 6:
                                    dropRandom("item", 18, 3);
                                    dropRandom("item", 19, 1);
                                    dropRandom('block', 53, 1, 3);
                                    break;
                                case 10:
                                    storageObjects.some(function (element, i) {
                                        if (i > 5) {
                                            var coord = relToAbs(sectorX, sectorY, Math.round(mouse().x), Math.round(mouse().y));
                                            if ((element.coord[0] == coord[0]) && (element.coord[1] == coord[1])) {
                                                storageObjects[i].data.forEach(function (ele, ind) {
                                                    if (ele.type != "") {
                                                        for (var e = ele.count; e > 0; e--) {
                                                            entityItems.push(new entity(ele.type, ele.data, relToAbs(sectorX,sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, 0, 0, 0, g));
                                                        };
                                                    };
                                                });
                                                storageObjects.splice(i, 1);
                                                return true;
                                            };
                                        };
                                    });
                                    entityItems.push(new entity("block", 10, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, -2, 0, 0, g));
                                    break;
                                case 11:
                                    storageObjects.some(function (element, i) {
                                        if (i > 5) {
                                            var coord = relToAbs(sectorX, sectorY, Math.round(mouse().x), Math.round(mouse().y));
                                            if ((element.coord[0] == coord[0]) && (element.coord[1] == coord[1])) {
                                                storageObjects[i].data.forEach(function (ele, ind) {
                                                    if (ele.type != "") {
                                                        for (var e = ele.count; e > 0; e--) {
                                                            entityItems.push(new entity(ele.type, ele.data, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, 0, 0, 0, g));
                                                        };
                                                    };
                                                });
                                                storageObjects.splice(i, 1);
                                                return true;
                                            };
                                        };
                                    });
                                    entityItems.push(new entity("block", 11, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, -2, 0, 0, g));
                                    break;
                                case 14:
                                    storageObjects.some(function (element, i) {
                                        if (i > 5) {
                                            var coord = relToAbs(sectorX, sectorY, Math.round(mouse().x), Math.round(mouse().y));
                                            if ((element.coord[0] == coord[0]) && (element.coord[1] == coord[1])) {
                                                storageObjects[i].data.forEach(function (ele, ind) {
                                                    if (ele.type != "") {
                                                        for (var e = ele.count; e > 0; e--) {
                                                            entityItems.push(new entity(ele.type, ele.data, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, 0, 0, 0, g));
                                                        };
                                                    };
                                                });
                                                storageObjects.splice(i, 1);
                                                // remove smeltingOperation if necessary
                                                smeltingOperations.some(function (operation, index) {
                                                    if (operation.index == i) {
                                                        smeltingOperations.splice(index, 1);
                                                    };
                                                });
                                                return true;
                                            };
                                        };
                                    });
                                    entityItems.push(new entity("block", 14, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, -2, 0, 0, g));
                                    break;
                                case 19:
                                    dropRandom("item", 44, 3);
                                    break;
                                case 23:
                                    dropRandom("item", 20, 1);
                                    dropRandom("block", 23, 1);
                                    break;
                                case 27:
                                    layer0[index(Math.round(mouse().x), Math.round(mouse().y))] = 0;
                                    layer0[index(Math.round(mouse().x), Math.round(mouse().y - 1))] = 0;
                                    entityItems.push(new entity("item", 59, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, -2, 0, 0, g));
                                    break;
                                case 28:
                                    layer0[index(Math.round(mouse().x), Math.round(mouse().y))] = 0;
                                    layer0[index(Math.round(mouse().x), Math.round(mouse().y + 1))] = 0;
                                    entityItems.push(new entity("item", 59, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, -2, 0, 0, g));
                                    break;
                                case 29:
                                    layer0[index(Math.round(mouse().x), Math.round(mouse().y))] = 0;
                                    layer0[index(Math.round(mouse().x), Math.round(mouse().y - 1))] = 0;
                                    entityItems.push(new entity("item", 59, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, -2, 0, 0, g));
                                    break;
                                case 30:
                                    layer0[index(Math.round(mouse().x), Math.round(mouse().y))] = 0;
                                    layer0[index(Math.round(mouse().x), Math.round(mouse().y + 1))] = 0;
                                    entityItems.push(new entity("item", 59, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, -2, 0, 0, g));
                                    break;
                                case 31:
                                    layer0[index(Math.round(mouse().x), Math.round(mouse().y))] = 0;
                                    layer0[index(Math.round(mouse().x+1), Math.round(mouse().y))] = 0;
                                    entityItems.push(new entity("item", 48, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, -2, 0, 0, g));
                                    break;
                                case 32:
                                    layer0[index(Math.round(mouse().x), Math.round(mouse().y))] = 0;
                                    layer0[index(Math.round(mouse().x - 1), Math.round(mouse().y))] = 0;
                                    entityItems.push(new entity("item", 48, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, -2, 0, 0, g));
                                    break;
                                default:
                                    if ([38, 40, 42, 44,46].indexOf(selectedBlock) != -1) {
                                        selectedBlock--;
                                    };
                                    // create same block entity
                                    entityItems.push(new entity("block", selectedBlock, relToAbs(sectorX, sectorY, Math.round(mouse().x) + (0.25 - (Math.random() / 2)), Math.round(mouse().y)), 0, -2, 0, 0, g));
                            };
                            // experience
                            switch (toolType) {
                                case 0: if (blockTypeStone.indexOf(textNamesBlocks[selectedBlock]) != -1) {
                                    playerSkills.mining += 3; break;
                                };
                                    break;
                                case 1: if (blockTypeDirt.indexOf(textNamesBlocks[selectedBlock]) != -1) {
                                    playerSkills.mining += 2;
                                };
                                    break;
                                case 2: if (blockTypeWood.indexOf(textNamesBlocks[selectedBlock]) != -1) {
                                    playerSkills.woodcutting += 3;
                                };
                                    break;
                            };
                            return true;
                        };
                    });
                // sprite animation
                clearInterval(blockCrackUpdate);
                plrArmAction = false;
                clearInterval(plrArmUpdate);
                plrArmx = plrBodyx + 4;
                plrArmy = plrBodyy;
            };
        }, toolSpeed * 1000);
        mineability = false;
    } else if ((mineLayer == lastMineLayer) && ((Math.round(mouse().x) + (Math.round(mouse().y) * ww)) != lastIndex)) {
        // sprite animation
        plrArmAction = false;
        clearInterval(plrArmUpdate);
        plrArmx = plrBodyx + 4;
        plrArmy = plrBodyy;
        plrArmRot = 0;
        // mining
        clearInterval(blockCrackUpdate);
        blockCrackX = 0;
        mineability = true;
    };
};
// storage object constructor
function storage(type, slots, coordinate) {
    this.type = type;
    var dataArray = [];
    for (var i = 0; i < slots; i++) { dataArray.push({ type: "", data: 0, count: 0 }) };
    this.data = dataArray;
    this.coord = coordinate;
};
var storageObjects = [];
storageObjects[0] = { type: "drop" };
storageObjects[1] = new storage("inventory", 36);
storageObjects[3] = new storage("invcrafting", 3);
storageObjects[4] = new storage('help', 0);
storageObjects[5] = new storage('crafting', 27);
// pause
var pausePhysics = false;
var pauseRender = false;
// operation update
var updateCounter = 0;
var stopAnimLoop = false;
function updateMenu() {
    switch (menu) {
        case 0:
            // Titlescreen
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.drawImage(gui[0], 0, 0, 128, 128, 0, 0, cs, cs);
            text("play", 280, 328, 80);
            text("options", 280, 472, 80);
            text("credits", 280, 616, 80);
            buttonHighlight = false;
            break;
        case 1:
            // Generator Screen
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.drawImage(gui[0], 128, 0, 128, 128, 0, 0, cs, cs);
            text("terrain", 280, 272, 80);
            text("roughness", 280, 376, 72);
            text("generate", 280, 544, 80);
            text("back", 280, 904, 80);
            buttonHighlight = false;
            text(userRoughness.toString(), 656, 312, 128);
            break;
        case 2:
            // Options Menu
            ctx.drawImage(gui[0], 384, 0, 128, 128, 0, 0, cs, cs);
            text("back", 280, 904, 80);
            break;
        case 3:
            // The game
            ctx.drawImage(screens, 256, 0, 128, 128, 0, 0, cs, cs);
            world.push(new constructSector(0, 0, 96));
            if (worldPx == undefined && worldPy == undefined) {
                worldPx = 1;
                worldPy = 125;
            };
            loadSector();
            stopAnimLoop = false;
            animLoop();
            break;
        case 4:
            // Credits
            ctx.drawImage(gui[0], 384, 0, 128, 128, 0, 0, cs, cs);
            text("a game made by:", 8, 8, 80);
            text("sg_p4x347", 256, 184, 80);
            text("special thanks to:", 8, 360, 80);
            text("chase", 256, 536, 80);
            text("scott, riley, david", 128, 712, 80);
            text("back", 280, 904, 80);
            break;
        case 5:
            // Respawn screen
            ctx.drawImage(gui[0], 0, 128, 128, 128, 0, 0, cs, cs);
            statctx.clearRect(0, 0, 512, 1024);
            text("Respawn", 280, 40, 80);
            text('You are dead!', 32, 448, 128);
            text("titlescreen", 280, 908, 72);
            break;
    };
};
// drag and drop
var drag = false;
var dragStartIndex;
var dragEndIndex;
var inventoryHoverX;
var inventoryHoverY;
var storageHoverIndex;
var dragItem = { type: "", data: 0, count: 0 };
var dragStartStorage;
var storageGUI = 0;
function dragStart() {
    dragItem.type = storageObjects[storageHoverIndex].data[dragStartIndex].type;
    dragItem.data = storageObjects[storageHoverIndex].data[dragStartIndex].data;
    dragItem.count = storageObjects[storageHoverIndex].data[dragStartIndex].count;
    storageObjects[storageHoverIndex].data[dragStartIndex].type = "";
    storageObjects[storageHoverIndex].data[dragStartIndex].data = 0;
    storageObjects[storageHoverIndex].data[dragStartIndex].count = 0;
    dragStartStorage = storageHoverIndex;
    if (dragItem.type != "") {
        drag = true;
    } else {
        drag = false;
    };
};
function dragEnd() {
    dragStartStorage = storageHoverIndex;
    if (storageObjects[storageHoverIndex].data[dragEndIndex].type == "") {
        storageObjects[storageHoverIndex].data[dragEndIndex].type = dragItem.type;
        storageObjects[storageHoverIndex].data[dragEndIndex].data = dragItem.data;
        storageObjects[storageHoverIndex].data[dragEndIndex].count = dragItem.count;
        dragItem = { type: "", data: 0, count: 0 };
        drag = false;
    } else {
        if ((storageObjects[storageHoverIndex].data[dragEndIndex].type == dragItem.type)&&(storageObjects[storageHoverIndex].data[dragEndIndex].data == dragItem.data)) {
            storageObjects[storageHoverIndex].data[dragEndIndex].count += dragItem.count;
            dragItem = { type: "", data: 0, count: 0 };
            drag = false;
        } else {
            var swapItem = { type: "", data: 0, count: 0 };
            swapItem.type = storageObjects[storageHoverIndex].data[dragEndIndex].type;
            swapItem.data = storageObjects[storageHoverIndex].data[dragEndIndex].data;
            swapItem.count = storageObjects[storageHoverIndex].data[dragEndIndex].count;
            storageObjects[storageHoverIndex].data[dragEndIndex].type = dragItem.type;
            storageObjects[storageHoverIndex].data[dragEndIndex].data = dragItem.data;
            storageObjects[storageHoverIndex].data[dragEndIndex].count = dragItem.count;
            dragItem.type = swapItem.type;
            dragItem.data = swapItem.data;
            dragItem.count = swapItem.count;
            drag = true;
        };
    };
    updateEquippedItem();
};
function dragBack() {
    if (storageObjects[dragStartStorage].data[dragStartIndex].type == "") {
        storageObjects[dragStartStorage].data[dragStartIndex].type = dragItem.type;
        storageObjects[dragStartStorage].data[dragStartIndex].data = dragItem.data;
        storageObjects[dragStartStorage].data[dragStartIndex].count = dragItem.count;
        dragItem = { type: "", data: 0, count: 0 };
        drag = false;
    } else {
        storageObjects[dragStartStorage].data[dragStartIndex].count += dragItem.count;
        dragItem = { type: "", data: 0, count: 0 };
        drag = false;
    };
};
// clear the TDC value (type, data, count)
function clearTDC(object) {
    object.type = "";
    object.data = 0;
    object.count = 0;
};
// hotbar
storageObjects[2] = new storage("hotbar", 81);
var selectionIndex = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var equipmentIndex = 0;
function updateEquippedItem() {
    storageObjects[2].data.forEach(function (ele, index) {
        if (ele.type != "") {
            storageObjects[1].data.some(function (element) {
                if ((element.type == ele.type) && (element.count > 0) && (element.data == ele.data)) {
                    ele.count = 1;
                    return true;
                } else {ele.count = 0};
            });
        };
    });
    equippedItem = {
        type: storageObjects[2].data[selectionIndex[equipmentIndex] + (equipmentIndex * 9)].type,
        data: storageObjects[2].data[selectionIndex[equipmentIndex] + (equipmentIndex * 9)].data,
        count: storageObjects[2].data[selectionIndex[equipmentIndex] + (equipmentIndex * 9)].count
    };
    if ((equippedItem.type != "") || (equippedItem.count != 0)) {
        var sy = Math.floor(equippedItem.data / 32);
        var sx = equippedItem.data - (sy * 32);
        if (equippedItem.type == "block") {
            equippedItemTexture.type = blockSheet;
            equippedItemTexture.sx = sx;
            equippedItemTexture.sy = sy;
            equippedItemTexture.size = 8;
        } else {
            equippedItemTexture.type = itemSheet;
            equippedItemTexture.sx = sx;
            equippedItemTexture.sy = sy;
            equippedItemTexture.size = 32;
        };
    };
};
// audio
var channel_max = 10;								// number of channels
var audiochannels = new Array();
for (var a = 0; a < channel_max; a++) {				// prepare the channels
    audiochannels[a] = new Array();
    audiochannels[a]['channel'] = new Audio();		// create a new audio object
    audiochannels[a]['finished'] = -1;				// expected end time for this channel
};
function audio(sound) {
    for (var a = 0; a < audiochannels.length; a++) {
        var thistime = new Date();
        if (audiochannels[a]['finished'] < thistime.getTime()) {
            audiochannels[a]['finished'] = thistime.getTime() + sound.duration * 1000;
            audiochannels[a]['channel'].src = sound.src;
            audiochannels[a]['channel'].load();
            audiochannels[a]['channel'].play();
            break;
        }
    }
};
// Crafting
var currentRecipe;
function crafting() {
    // search for recipe that satisfies what is in the crafting table
    craftingRecipes.some(function (recipe, i) {
        if ((storageGUI != 3)||((storageGUI == 3) && (recipe.type == "conversion"))) {
            var user = storageObjects[storageGUI].data;
            var create = false;
            var slot;
            if (storageObjects[storageGUI].type == "crafting") { slot = 26; } else if (storageObjects[storageGUI].type == "invcrafting") { slot = 2; };
            if ((recipe.tool.type == storageObjects[storageGUI].data[slot].type) && (recipe.tool.data == storageObjects[storageGUI].data[slot].data) && (recipe.tool.count <= storageObjects[storageGUI].data[slot].count)) {
                if ((recipe.type == "shaped")&&(storageGUI != 3)) {
                    craftingRecipes[i].data.some(function (data, index) {
                        if ((data.type == user[index].type) && (data.data == user[index].data) && (data.count <= user[index].count)) {
                            create = true;
                        } else {
                            create = false;
                            return true;
                        };
                    });
                } else if ((recipe.type == "conversion") && (storageGUI != 3)) {
                    var occurrence = 0;
                    user.some(function (data, index) {
                        if (index <= 24) {
                            if ((data.type == recipe.data[0].type) && (data.data == recipe.data[0].data) && (data.count >= recipe.data[0].count)) {
                                occurrence++;
                            } else if (data.type != '') {
                                occurrence = 0;
                                return true;
                            };
                        };
                    });
                    if (occurrence == 1) { create = true; } else { create = false; };
                } else if ((recipe.type == "conversion") && (storageGUI == 3)) {
                    if ((user[0].type == recipe.data[0].type) && (user[0].data == recipe.data[0].data) && (user[0].count >= recipe.data[0].count)) {
                        create = true;
                    } else { create = false; };
                };
            };
            if (storageObjects[storageGUI].type == "crafting") { slot = 25; } else if (storageObjects[storageGUI].type == "invcrafting") { slot = 1; };
            if (create) {
                currentRecipe = i;               
                user[slot].type = recipe.output.type;
                user[slot].data = recipe.output.data;
                user[slot].count = recipe.output.count;
                return true;
            } else {
                currentRecipe = -1
                user[slot].type = "";
                user[slot].data = 0;
                user[slot].count = 0;
            };
        };
    });
};
function craftRecipe() {
    if (currentRecipe != -1) {
        storageObjects[storageGUI].data.forEach(function (element, index) {
            if ((storageGUI != 3) && (craftingRecipes[currentRecipe].type == "conversion")) {
                if (index < 25) {
                    element.count -= craftingRecipes[currentRecipe].data[0].count;
                };
            } else if ((storageGUI != 3) && (craftingRecipes[currentRecipe].type == "shaped")) {
                if (index < 25) {
                    element.count -= craftingRecipes[currentRecipe].data[index].count;
                };
            } else if ((storageGUI == 3)&&(craftingRecipes[currentRecipe].type == "conversion") && (index == 0)) {
                element.count -= craftingRecipes[currentRecipe].data[index].count;
            };          
            if (element.count <= 0) {
                clearTDC(element);
            };
        });
        // experience
        playerSkills.crafting += 3;
    };
}
// Smelting
var smeltingOperations = [];
// fuels, number indicates quantity of time to burn
var fuels = { 'Coal': 4, 'Grass': 1.5, 'Elm Log': 3, 'Elm Planks': 2.5, 'Elm Stick': 2 };
// smelting Operation contructor
function smeltingOperation(storageIndex,time,recipe,fuel) {
    this.index = storageIndex;
    this.time = time;
    this.recipe = recipe;
    this.fuel = fuel;
};
// check every smelting operation for valid recipes, and delete an operation if necessary
function updateSmeltingOperations() {
    // check every smelting operation
    smeltingOperations.forEach(function (operation, Index) {
        // search for recipe that satisfies what is in the furnace
        var recipeSearch = false;
        var recipeIndex;
        if (compareTDC(smeltingRecipes[operation.recipe].cast, storageObjects[operation.index].data[3]) && (storageObjects[operation.index].data[2].count > 0) && ((fuels[textNamesItems[storageObjects[operation.index].data[2].data]]) || (fuels[textNamesBlocks[storageObjects[operation.index].data[2].data]]))) {
            if ((smeltingRecipes[operation.recipe].type == "smelt") && 
                ((compareTDC(smeltingRecipes[operation.recipe].input[0], storageObjects[operation.index].data[0]) && (compareTDC(smeltingRecipes[operation.recipe].input[1], storageObjects[operation.index].data[1]))) ||
                (compareTDC(smeltingRecipes[operation.recipe].input[0],storageObjects[operation.index].data[1]) && compareTDC(smeltingRecipes[operation.recipe].input[1],storageObjects[operation.index].data[0])) ||
                (compareTDC(smeltingRecipes[operation.recipe].input[0],storageObjects[operation.index].data[0]) && compareTDC(smeltingRecipes[operation.recipe].input[0],storageObjects[operation.index].data[1]))) &&
                (smeltingRecipes[operation.recipe].input[0].count <= (storageObjects[operation.index].data[0].count + storageObjects[operation.index].data[1].count))&&
                ((compareTDC(smeltingRecipes[operation.recipe].slag, storageObjects[operation.index].data[4])) || (compareTDC(storageObjects[operation.index].data[4],{type:"",data:0,count:0}))) &&
                ((compareTDC(smeltingRecipes[operation.recipe].output, storageObjects[operation.index].data[5])) || (compareTDC(storageObjects[operation.index].data[5], { type: "", data: 0, count: 0 })))) {
                recipeSearch = true;
            } else if ((smeltingRecipes[operation.recipe].type == "alloy") &&
                ((compareTDC(smeltingRecipes[operation.recipe].input[0], storageObjects[operation.index].data[0],0) && compareTDC(smeltingRecipes[operation.recipe].input[1], storageObjects[operation.index].data[1],0)) ||
                (compareTDC(smeltingRecipes[operation.recipe].input[0], storageObjects[operation.index].data[1],0) && compareTDC(smeltingRecipes[operation.recipe].input[1], storageObjects[operation.index].data[0],0))) &&
                ((compareTDC(smeltingRecipes[operation.recipe].slag, storageObjects[operation.index].data[4])) || (compareTDC(storageObjects[operation.index].data[4], { type: "", data: 0, count: 0 }))) &&
                ((compareTDC(smeltingRecipes[operation.recipe].output, storageObjects[operation.index].data[5])) || (compareTDC(storageObjects[operation.index].data[5], { type: "", data: 0, count: 0 })))) {
                recipeSearch = true;
            };         
        };
        if (!recipeSearch) {
            // delete operation
            smeltingOperations.splice(Index,1);
            return true;
        } else {
            // introduce new fuel
            if (operation.fuel <= 0) {
                storageObjects[operation.index].data[2].count--;
                var fuelTime;
                if (storageObjects[operation.index].data[2].type == 'item') {
                    fuelTime = fuels[textNamesItems[storageObjects[operation.index].data[2].data]];
                } else {
                    fuelTime = fuels[textNamesBlocks[storageObjects[operation.index].data[2].data]];
                };
                operation.fuel += fuelTime;
            };
            // deplete fuel
            operation.fuel -= 0.1;
            if (storageObjects[operation.index].data[2].count <= 0) {
                clearTDC(storageObjects[operation.index].data[2]);
            };
            // calculate smelting time
            var time;
            var coord = absToRel(storageObjects[operation.index].coord[0], storageObjects[operation.index].coord[1])
            switch (layer0[index(coord[0], coord[1])]) {
                case 14: time = smeltingRecipes[operation.recipe].time;
                    break;
            };
            if (operation.time < 1) {
                operation.time += (1/time)*(t * 6);
            } else {
                // deplete inputs
                switch (smeltingRecipes[operation.recipe].type) {
                    case "smelt":
                        storageObjects[operation.index].data[0].count -= smeltingRecipes[operation.recipe].input[0].count;
                        var difference = storageObjects[operation.index].data[0].count;
                        if (difference < 0) {
                            storageObjects[operation.index].data[1].count += difference;
                        };
                        break;
                    case "alloy":
                        if (compareTDC(storageObjects[operation.index].data[0], smeltingRecipes[operation.recipe].input[0])) {
                            storageObjects[operation.index].data[0].count -= smeltingRecipes[operation.recipe].input[0].count;
                            storageObjects[operation.index].data[1].count -= smeltingRecipes[operation.recipe].input[1].count;
                        } else {
                            storageObjects[operation.index].data[0].count -= smeltingRecipes[operation.recipe].input[1].count;
                            storageObjects[operation.index].data[1].count -= smeltingRecipes[operation.recipe].input[0].count;
                        };
                        break;
                };
                if (storageObjects[operation.index].data[0].count <= 0) {
                    clearTDC(storageObjects[operation.index].data[0]);
                } else if (storageObjects[operation.index].data[1].count <= 0) {
                    clearTDC(storageObjects[operation.index].data[1]);
                };
                // deplete cast

                // create slag
                storageObjects[operation.index].data[4].type = smeltingRecipes[operation.recipe].slag.type;
                storageObjects[operation.index].data[4].data = smeltingRecipes[operation.recipe].slag.data;
                storageObjects[operation.index].data[4].count += smeltingRecipes[operation.recipe].slag.count;
                // create output
                storageObjects[operation.index].data[5].type = smeltingRecipes[operation.recipe].output.type;
                storageObjects[operation.index].data[5].data = smeltingRecipes[operation.recipe].output.data;
                storageObjects[operation.index].data[5].count += smeltingRecipes[operation.recipe].output.count;
                // reset time
                operation.time = 0;
                // experience
                playerSkills.smithing += 3;
            }
        };
    });
};
// check the active furnace for a valid recipe, and create an operation if necessary
function smelting() {
    // search for recipe that satisfies what is in the furnace
    var recipeSearch = false;
    var recipeIndex;
    smeltingRecipes.some(function (recipe, i) {
        if (compareTDC(recipe.cast, storageObjects[storageGUI].data[3]) && (storageObjects[storageGUI].data[2].count > 0) && ((fuels[textNamesItems[storageObjects[storageGUI].data[2].data]]) || (fuels[textNamesBlocks[storageObjects[storageGUI].data[2].data]]))) {
            if ((recipe.type == "smelt") && 
                ((compareTDC(recipe.input[0], storageObjects[storageGUI].data[0])&&(compareTDC(recipe.input[1], storageObjects[storageGUI].data[1]))) ||
                (compareTDC(recipe.input[0],storageObjects[storageGUI].data[1]) && compareTDC(recipe.input[1],storageObjects[storageGUI].data[0])) ||
                (compareTDC(recipe.input[0],storageObjects[storageGUI].data[0]) && compareTDC(recipe.input[0],storageObjects[storageGUI].data[1]))) &&
                (recipe.input[0].count <= (storageObjects[storageGUI].data[0].count + storageObjects[storageGUI].data[1].count))&&
                ((compareTDC(recipe.slag, storageObjects[storageGUI].data[4])) || (compareTDC(storageObjects[storageGUI].data[4],{type:"",data:0,count:0}))) &&
                ((compareTDC(recipe.output, storageObjects[storageGUI].data[5])) || (compareTDC(storageObjects[storageGUI].data[5], { type: "", data: 0, count: 0 })))) {
                recipeSearch = true;
                recipeIndex = i;
                return true;
            } else if ((recipe.type == "alloy") &&
                ((compareTDC(recipe.input[0], storageObjects[storageGUI].data[0],0) && compareTDC(recipe.input[1], storageObjects[storageGUI].data[1],0)) ||
                (compareTDC(recipe.input[0], storageObjects[storageGUI].data[1],0) && compareTDC(recipe.input[1], storageObjects[storageGUI].data[0],0))) &&
                ((compareTDC(recipe.slag, storageObjects[storageGUI].data[4])) || (compareTDC(storageObjects[storageGUI].data[4], { type: "", data: 0, count: 0 }))) &&
                ((compareTDC(recipe.output, storageObjects[storageGUI].data[5])) || (compareTDC(storageObjects[storageGUI].data[5], { type: "", data: 0, count: 0 })))) {
                recipeSearch = true;
                recipeIndex = i;
                return true;
            };         
        };
    });
    if (recipeSearch) {
        var operationSearch = false;
        var operationIndex;
        smeltingOperations.some(function (operation, index) {
            if (null != storageObjects[operation.index]) {
                operationSearch = true;
                operationIndex = index;
                return true;
            };
        });
        if ((operationSearch && (smeltingOperations[operationIndex].recipe != recipeIndex)) || (!operationSearch)) {
            // delete old operation
            smeltingOperations.splice(operationIndex, 1);
            // create new smelting Operation
            smeltingOperations.push(new smeltingOperation(storageGUI, 0, recipeIndex, 0));
        };
        return true;
    } else {
        // delete old operation
        smeltingOperations.splice(operationIndex, 1);
    };
};

//----------------
// Event listeners
//----------------

// movement
var allowJump = true;
var allowLeft = true;
var allowRight = true;
var plrArmAction = false;
var allowLeftAnim = true;
window.addEventListener("keydown", function (evt) {
    keyMap.splice(evt.keyCode, 1, true);
    if (!gameConsole) {
        // A
        if (keyMap[65] && allowLeft && !keyMap[68]) {
            pxacc = -7; allowLeft = false;
            plrBodyy = 0;
            if (!plrArmAction) { plrArmy = plrBodyy };
            plrBodyUpdate = setInterval(function () {
                plrBodyx++;
                if (plrBodyx > 3) { plrBodyx = 0; };
                if (!plrArmAction) {
                    plrArmy = plrBodyy;
                    plrArmx = plrBodyx + 4;
                };
            }, 100);
        };
        // D
        if (keyMap[68] && allowRight && !keyMap[65]) {
            pxacc = 7; allowRight = false;
            plrBodyy = 1;
            if (!plrArmAction) { plrArmy = plrBodyy };
            plrBodyUpdate = setInterval(function () {
                plrBodyx++;
                if (plrBodyx > 3) { plrBodyx = 0; };
                if (!plrArmAction) {
                    plrArmy = plrBodyy;
                    plrArmx = plrBodyx + 4;
                };
            }, 100);
        };
        // E
        if (keyMap[69] && buttonLast) {
            if (inventory) {
                if (storageGUI == 4|| storageGUI == 5) {
                    storageGUI = 3;
                } else {
                    inventory = false;
                    pausePhysics = false;
                    storageGUI = 0;
                };
                pauseRender = false;
            } else if (!inventory) {
                inventory = true;
                storageGUI = 3;
                pausePhysics = true;
            };
            buttonLast = false;
        };

        // Esc
        if (keyMap[27] && inventory) {
            if (storageGUI == 4 || storageGUI == 5) {
                storageGUI = 3;
            } else {
                inventory = false;
                pausePhysics = false;
                storageGUI = 0;
            };
            pauseRender = false;
        };
    } else if (gameConsole) {
        // Esc
        if (keyMap[27] && gameConsole) {
            gameConsole = false;
            command = '';
            pausePhysics = false;
            pauseRender = false;
        };
        // console command input
        if (gameConsole) {
            if ([13,16,17].indexOf(evt.keyCode) == -1) {
                if (evt.keyCode == 8) {
                    command = command.substring(0, command.length - 1);
                } else {
                    var newChar;
                    switch (evt.keyCode) {
                        case 186: newChar = ';'; break;
                        case 188: newChar = ','; break;
                        case 189: newChar = '-'; break;
                        case 190: newChar = '.'; break;
                        case 191: newChar = '/'; break;
                        case 219: newChar = '{'; break;
                        case 221: newChar = '}'; break;
                        default: newChar = String.fromCharCode(evt.keyCode);
                            break;
                    };
                    command = command + newChar;
                };
            };
        };
        if (evt.keyCode == 13) {
            command = command.toLowerCase();
            var splitCommand = command.split(" ");
            switch (splitCommand[0]) {
                case 'spawn':
                    var hackStack = { type: '', data: 0, count: Number(splitCommand[1]) };           
                    var textName = '';
                    for (var i = 2; i < splitCommand.length; i++) {
                        var first = splitCommand[i].substr(0, 1).toUpperCase();
                        splitCommand[i] = first + splitCommand[i].substring(1, splitCommand[i].length);
                        if (i > 2) {
                            splitCommand[i] = ' '+splitCommand[i];
                        };
                        textName = textName + splitCommand[i];
                    };
                    if (textNamesBlocks.indexOf(textName) != -1) {
                        hackStack.type = 'block';
                        hackStack.data = textNamesBlocks.indexOf(textName);
                    } else if (textNamesItems.indexOf(textName) != -1) {
                        if (textNamesTools.indexOf(textName) != -1) {
                            hackStack.type = 'tool';
                        } else {
                            hackStack.type = 'item';
                        };
                        hackStack.data = textNamesItems.indexOf(textName);
                    } else { break; };
                    var s = 0;
                    while (!compareTDC(storageObjects[1].data[s], hackStack)) {
                        s++;
                        if (s == 36) { break; };
                    };
                    if (s == 36) {
                        s = 0;
                        while (!(storageObjects[1].data[s].type == "")) {
                            s++;
                            if (s == 36) { break; };
                        };
                    };
                    if (s < 36) {
                        storageObjects[1].data[s].type = hackStack.type;
                        storageObjects[1].data[s].data = hackStack.data;
                        storageObjects[1].data[s].count += hackStack.count;
                        updateEquippedItem();
                    };
                    break;
                case 'buff':
                    if (splitCommand.length == 1) {
                        playerStats.health = 100;
                        playerStats.thirst = 100;
                        playerStats.hunger = 100;
                        playerStats.fatigue = 100;
                        playerStats.oxygen = 100;
                    } else {
                        switch (splitCommand[1]) {
                            case 'health': playerStats.health = 100; break;
                            case 'thirst': playerStats.thirst = 100; break;
                            case 'hunger': playerStats.hunger = 100; break;
                            case 'fatigue': playerStats.fatigue = 100; break;
                            case 'oxygen': playerStats.oxygen = 100; break;
                        };
                    };
                    break;
                case 'debuff':
                    if (splitCommand.length == 1) {
                        playerStats.thirst = 0;
                        playerStats.hunger = 0;
                        playerStats.fatigue = 0;
                        playerStats.oxygen = 0;
                    } else {
                        switch (splitCommand[1]) {
                            case 'health': playerStats.health = 0; break;
                            case 'thirst': playerStats.thirst = 0; break;
                            case 'hunger': playerStats.hunger = 0; break;
                            case 'fatigue': playerStats.fatigue = 0; break;
                            case 'oxygen': playerStats.oxygen = 0; break;
                        };
                    };
                    break;
                case 'gravity':
                    g = Number(splitCommand[1]);
                    break;
                case 'xp':
                    var xp = Number(splitCommand[1]);
                    switch (splitCommand[2]) {
                        case 'woodcutting': playerSkills.woodcutting += xp; break;
                        case 'mining': playerSkills.mining += xp; break;
                        case 'construction': playerSkills.construction += xp; break;
                        case 'crafting': playerSkills.crafting += xp; break;
                        case 'smithing': playerSkills.smithing += xp; break;
                        case 'farming': playerSkills.farming += xp; break;
                        case 'cooking': playerSkills.cooking += xp; break;
                        case 'hunting': playerSkills.hunting += xp; break;
                        case 'survival': playerSkills.survival += xp; break;
                    };
                    break;
                case 'tp':
                    worldPx = Number(splitCommand[1]);
                    worldPy = Number(splitCommand[2]);
                    sectorX = Math.floor(worldPx / 256);
                    sectorY = Math.floor(worldPy / 256);
                    break;
                case 'kill':
                    if (splitCommand.length == 1) {
                        playerStats.health = 0;
                    } else {
                        switch (splitCommand[1]) {
                            case 'items':
                                entityItems = [];
                                break;
                        };
                    };
                    break;
                case 'explode':
                    var radius = Number(splitCommand[1]);
                    for (var iY = py - radius; iY < py + radius; iY++) {
                        for (var iX = px - radius; iX < px + radius; iX++) {
                            var width = iX - px;
                            var height = iY - py;
                            if (((width * width) + (height * height)) <= (radius * radius)) {
                                if (iX > 0 && iY > 0 && iX < 256 && iY < 256) {
                                    layer0[index(Math.round(iX), Math.round(iY))] = 0;
                                };
                            };
                        };
                    };
                    break;
            };
            command = '';
        };
    };
    // Ctrl
    if (keyMap[17]) {
        if (gameConsole) {
            gameConsole = false;
            command = '';
            pausePhysics = false;
            pauseRender = false;
        } else if (!gameConsole) {
            gameConsole = true;
            pausePhysics = true;
            pauseRender = true;
        };
    };
    evt.preventDefault();
    evt.stopPropagation();
    evt.cancelBubble = true;
    return false;
});
window.addEventListener("keyup", function (evt) {
    keyMap.splice(evt.keyCode, 1, false);
    if (!keyMap[83]) { };
    if (!keyMap[65] && !allowLeft) {
        pxacc = 0; allowLeft = true;
        clearInterval(plrBodyUpdate);
        plrBodyx = 0;
        plrBodyy = 0;
        if (!plrArmAction) {
            plrArmy = plrBodyy;
            plrArmx = plrBodyx + 4;
        };
    };
    if (!keyMap[68] && !allowRight) {
        pxacc = 0; allowRight = true;
        clearInterval(plrBodyUpdate);
        plrBodyx = 0;
        plrBodyy = 1;
        if (!plrArmAction) {
            plrArmy = plrBodyy;
            plrArmx = plrBodyx + 4;
        };
    };
    if (!keyMap[69]) {
        buttonLast = true;
    };
});
window.addEventListener("mousemove", function (evt) {
    cx = getMousePos(canvas, evt).x;
    cy = getMousePos(canvas, evt).y;
    switch (menu) {
        case 0:
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            if ((256 < cx) && (cx < 768) && (304 < cy) && (cy < 432)) {
                if (!buttonHighlight) {
                    ctx.fillRect(256, 304, 512, 128);
                    buttonHighlight = true;
                };
            } else if ((256 < cx) && (cx < 768) && (448 < cy) && (cy < 576)) {
                if (!buttonHighlight) {
                    ctx.fillRect(256, 448, 512, 128);
                    buttonHighlight = true;
                };
            } else if ((256 < cx) && (cx < 768) && (592 < cy) && (cy < 720)) {
                if (!buttonHighlight) {
                    ctx.fillRect(256, 592, 512, 128);
                    buttonHighlight = true;
                };
            } else {
                if (buttonHighlight) {
                    ctx.drawImage(gui[0], 0, 0, 128, 128, 0, 0, cs, cs);
                    text("play", 280, 328, 80);
                    text("options", 280, 472, 80);
                    text("credits", 280, 616, 80);
                    buttonHighlight = false;
                };
            };
            break;
        case 1:
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            if ((256 < cx) && (cx < 768) && (520 < cy) && (cy < 648)) {
                // Generate button
                if (!buttonHighlight) {
                    ctx.fillRect(256, 520, 512, 128);
                    buttonHighlight = true;
                };
            } else if ((664 < cx) && (cx < 712) && (272 < cy) && (cy < 304)) {
                // Up arrow
                if (!buttonHighlight) {
                    ctx.drawImage(gui[1], 56, 0, 6, 4, 664, 272, 48, 32);
                    buttonHighlight = true;
                };
            } else if ((664 < cx) && (cx < 712) && (448 < cy) && (cy < 480)) {
                // Down arrow
                if (!buttonHighlight) {
                    ctx.drawImage(gui[1], 62, 0, 6, 4, 664, 448, 48, 32);
                    buttonHighlight = true;
                };
            } else if ((256 < cx) && (cx < 768) && (880 < cy) && (cy < 1008)) {
                // Back button
                if (!buttonHighlight) {
                    ctx.fillRect(256, 880, 512, 128);
                    buttonHighlight = true;
                };
            } else {
                if (buttonHighlight) {
                    ctx.drawImage(gui[0], 128, 0, 128, 128, 0, 0, cs, cs);
                    text("terrain", 280, 272, 80);
                    text("roughness", 280, 376, 72);
                    text("generate", 280, 544, 80);
                    text("back", 280, 904, 80);
                    buttonHighlight = false;
                };
            };
            text(userRoughness.toString(), 656, 312, 128);
            break;
        case 2:
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            if ((256 < cx) && (cx < 768) && (880 < cy) && (cy < 1008)) {
                // Back button
                if (!buttonHighlight) {
                    ctx.fillRect(256, 880, 512, 128);
                    buttonHighlight = true;
                };
            } else {
                if (buttonHighlight) {
                    ctx.drawImage(gui[0], 384, 0, 128, 128, 0, 0, cs, cs);
                    text("back", 280, 904, 80);
                    buttonHighlight = false;
                };
            };
            break;
        case 4:
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            if ((256 < cx) && (cx < 768) && (880 < cy) && (cy < 1008)) {
                // Back button
                if (!buttonHighlight) {
                    ctx.fillRect(256, 880, 512, 128);
                    buttonHighlight = true;
                };
            } else {
                if (buttonHighlight) {
                    ctx.drawImage(gui[0], 384, 0, 128, 128, 0, 0, cs, cs);
                    text("a game made by:", 8, 8, 80);
                    text("sg_p4x347", 256, 184, 80);
                    text("special thanks to:", 8, 360, 80);
                    text("chase", 256, 536, 80);
                    text("scott, riley, david", 128, 712, 80);
                    text("back", 280, 904, 80);
                    buttonHighlight = false;
                };
            };
            break;
        case 5:
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            if ((256 < cx) && (cx < 768) && (16 < cy) && (cy < 144)) {
                // Respawn button
                if (!buttonHighlight) {
                    ctx.fillRect(256, 16, 512, 128);
                    buttonHighlight = true;
                };
            } else if ((256 < cx) && (cx < 768) && (880 < cy) && (cy < 1008)) {
                // Titlescreen button
                if (!buttonHighlight) {
                    ctx.fillRect(256, 880, 512, 128);
                    buttonHighlight = true;
                };
            } else {
                if (buttonHighlight) {
                    ctx.drawImage(gui[0], 0, 128, 128, 128, 0, 0, cs, cs);
                    statctx.clearRect(0, 0, 512, 1024);
                    text("Respawn", 280, 40, 80);
                    text('You are dead!', 32, 448, 128);
                    text("titlescreen", 280, 908, 72);
                    buttonHighlight = false;
                };
            };
            break;
        case 6:
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            if ((256 < cx) && (cx < 768) && (880 < cy) && (cy < 1008)) {
                // Back button
                if (!buttonHighlight) {
                    ctx.fillRect(256, 880, 512, 128);
                    buttonHighlight = true;
                };
            } else {
                if (buttonHighlight) {
                    ctx.drawImage(gui[0], 128, 128, 128, 128, 0, 0, cs, cs);
                    text("back", 280, 904, 80);
                    buttonHighlight = false;
                };
            };
            break;
    };
});
window.addEventListener("click", function (evt) {
    switch (menu) {
        case 0:
            if ((256 < cx) && (cx < 768) && (304 < cy) && (cy < 432) && buttonLast) {
                menu = 1; updateMenu();
            } else if ((256 < cx) && (cx < 768) && (448 < cy) && (cy < 576) && buttonLast) {
                menu = 2; updateMenu();
            } else if ((256 < cx) && (cx < 768) && (592 < cy) && (cy < 720) && buttonLast) {
                menu = 4; updateMenu();
            };
            break;
        case 1:
            if ((256 < cx) && (cx < 768) && (520 < cy) && (cy < 648) && buttonLast) {
                // Generate Button
                menu = 3; updateMenu();
            } else if ((664 < cx) && (cx < 712) && (272 < cy) && (cy < 304)) {
                // Up arrow
                if (userRoughness < 9) {
                    userRoughness++;
                };
                ctx.drawImage(gui[0], 128, 0, 128, 128, 0, 0, cs, cs);
                text("terrain", 280, 272, 80);
                text("roughness", 280, 376, 72);
                text("generate", 280, 544, 80);
                text("back", 280, 904, 80);
                ctx.drawImage(gui[1], 56, 0, 6, 4, 664, 272, 48, 32);
                text(userRoughness.toString(), 656, 312, 128);
            } else if ((664 < cx) && (cx < 712) && (448 < cy) && (cy < 480)) {
                // Down arrow
                if (userRoughness > 0) {
                    userRoughness--;
                };
                ctx.drawImage(gui[0], 128, 0, 128, 128, 0, 0, cs, cs);
                text("terrain", 280, 272, 80);
                text("roughness", 280, 376, 72);
                text("generate", 280, 544, 80);
                text("back", 280, 904, 80);
                ctx.drawImage(gui[1], 62, 0, 6, 4, 664, 448, 48, 32);
                text(userRoughness.toString(), 656, 312, 128);
            } else if ((256 < cx) && (cx < 768) && (880 < cy) && (cy < 1008)) {
                // Back button
                menu = 0; updateMenu();
            };
            break;
        case 2:
            if ((256 < cx) && (cx < 768) && (880 < cy) && (cy < 1008)) {
                // Back button
                menu = 0; updateMenu();
            };
            break;
        case 3:
            break;
        case 4:
            if ((256 < cx) && (cx < 768) && (880 < cy) && (cy < 1008)) {
                // Back button
                menu = 0; updateMenu();
            };
            break;
        case 5:
            if ((256 < cx) && (cx < 768) && (16 < cy) && (cy < 144)) {
                // Respawn button
                menu = 3;
                pausePhysics = false;
                pauseRender = false;
                stopAnimLoop = false;
                playerStats.health = 100;
                playerStats.thirst = 100;
                playerStats.hunger = 100;
                playerStats.fatigue = 100;
                playerStats.oxygen = 100;
                animLoop();
            } else if ((256 < cx) && (cx < 768) && (880 < cy) && (cy < 1008)) {
                // Titlescreen button
                menu = 0; updateMenu();
            };
            break;
    };
    evt.preventDefault();
	evt.stopPropagation();
    evt.cancelBubble = true;
    return false;
});
var click = false;
var clickLast = true;
window.addEventListener("mousedown", function (evt) {
    click = true;
    if (evt.which == 1) {
        switch (menu) {
            case 3:
                // inventory drag and drop
                if (inventory) {
                    if (storageHoverIndex != 5) {
                        if (!drag) {
                            // start drag
                            var storageIndex;
                            switch (storageObjects[storageHoverIndex].type) {
                                case "inventory":
                                    dragStartIndex = (inventoryHoverX + (inventoryHoverY * 9));
                                    if ((dragStartIndex >= 0) && (dragStartIndex < 36)) { dragStart(); } else { drag = false; dragItem = { type: "", data: 0, count: 0 }; };
                                    break;
                                case "hotbar":
                                    dragStartIndex = (inventoryHoverX + (inventoryHoverY * 9));
                                    if ((dragStartIndex >= 9) && (dragStartIndex < 18)) {
                                        equipmentIndex = inventoryHoverX;
                                    } else if ((dragStartIndex >= 0) && (dragStartIndex <= 8)) {
                                        storageObjects[2].data[inventoryHoverX + (equipmentIndex * 9)] = { type: "", data: 0, count: 0 };
                                    } else { drag = false; dragItem = { type: "", data: 0, count: 0 }; };
                                    break;
                                case "invcrafting":
                                    if ((inventoryHoverX == 0) && (inventoryHoverY == 0)) {
                                        dragStartIndex = 0;
                                        dragStart();
                                    } else if ((inventoryHoverX == 2) && (inventoryHoverY == 0)) {
                                        dragStartIndex = 1;
                                        dragStart();
                                        // craft currentRecipe once
                                        craftRecipe();
                                    } else if ((inventoryHoverX == 2) && (inventoryHoverY == 1)) {
                                        dragStartIndex = 2;
                                        dragStart();
                                    };
                                    crafting();
                                    break;
                                case "chest":
                                    dragStartIndex = (inventoryHoverX + (inventoryHoverY * 9));
                                    if ((dragStartIndex >= 0) && (dragStartIndex < 63)) { dragStart(); } else { drag = false; dragItem = { type: "", data: 0, count: 0 }; };
                                    break;
                                case "crafting":
                                    dragStartIndex = (inventoryHoverX + (inventoryHoverY * 5));
                                    if (inventoryHoverX <= 4) {
                                        dragStart();
                                    } else if ((inventoryHoverX == 6) && (inventoryHoverY == 2)) {
                                        dragStartIndex = 25;
                                        dragStart();
                                        // craft currentRecipe once
                                        craftRecipe();
                                    } else if ((inventoryHoverX == 6) && (inventoryHoverY == 3)) {
                                        dragStartIndex = 26;
                                        dragStart();
                                    } else {
                                        drag = false; dragItem = { type: "", data: 0, count: 0 };
                                    };
                                    crafting();
                                    break;
                                case "smelting":
                                    if ((inventoryHoverX == 0) && (inventoryHoverY == 0)) {
                                        dragStartIndex = 0;
                                        dragStart();
                                    } else if ((inventoryHoverX == 2) && (inventoryHoverY == 0)) {
                                        dragStartIndex = 1;
                                        dragStart();
                                    } else if ((inventoryHoverX == 1) && (inventoryHoverY == 2)) {
                                        dragStartIndex = 2;
                                        dragStart();
                                    } else if ((inventoryHoverX == 4) && (inventoryHoverY == 2)) {
                                        dragStartIndex = 3;
                                        dragStart();
                                    } else if ((inventoryHoverX == 5) && (inventoryHoverY == 1)) {
                                        dragStartIndex = 4;
                                        dragStart();
                                    } else if ((inventoryHoverX == 5) && (inventoryHoverY == 2)) {
                                        dragStartIndex = 5;
                                        dragStart();
                                    };
                                    smelting();
                                    break;
                                case "drop":
                                    drag = false;
                                    break;
                            };
                        } else {
                            // end drag
                            dragEndIndex = (inventoryHoverX + (inventoryHoverY * 9));
                            switch (storageObjects[storageHoverIndex].type) {
                                case "inventory":
                                    dragEndIndex = (inventoryHoverX + (inventoryHoverY * 9));
                                    if ((dragEndIndex >= 0) && (dragEndIndex < 36) && (drag)) {
                                        dragEnd();
                                    } else { dragBack(); };
                                    break;
                                case "hotbar":
                                    dragEndIndex = (inventoryHoverX + (inventoryHoverY * 9));
                                    if ((dragEndIndex >= 0) && (dragEndIndex < 9) && (drag)) {
                                        storageObjects[2].data[inventoryHoverX + (equipmentIndex * 9)].type = dragItem.type;
                                        storageObjects[2].data[inventoryHoverX + (equipmentIndex * 9)].data = dragItem.data;
                                        storageObjects[2].data[inventoryHoverX + (equipmentIndex * 9)].count = 1;
                                        dragBack();
                                    } else if (drag) { dragBack(); };
                                    break;
                                case "invcrafting":
                                    if ((inventoryHoverX == 0) && (inventoryHoverY == 0)) {
                                        dragEndIndex = 0;
                                        dragEnd();
                                    } else if ((inventoryHoverX == 2) && (inventoryHoverY == 0)) {
                                        var hoverIndex = 1;
                                        if ((storageObjects[storageGUI].data[hoverIndex].type == dragItem.type) && (storageObjects[storageGUI].data[hoverIndex].data == dragItem.data)) {
                                            dragItem.count += storageObjects[storageGUI].data[hoverIndex].count;
                                            storageObjects[storageGUI].data[hoverIndex].type = "";
                                            storageObjects[storageGUI].data[hoverIndex].data = 0;
                                            storageObjects[storageGUI].data[hoverIndex].count = 0;
                                            drag = true;
                                        };
                                        craftRecipe();
                                    } else if ((inventoryHoverX == 2) && (inventoryHoverY == 1)) {
                                        dragEndIndex = 2;
                                        dragEnd();
                                    } else {
                                        dragBack();
                                    };
                                    crafting();
                                    break;
                                case "chest":
                                    dragEndIndex = (inventoryHoverX + (inventoryHoverY * 9));
                                    if ((dragEndIndex >= 0) && (dragEndIndex < 72)) { dragEnd(); } else { dragBack(); };
                                    break;
                                case "crafting":
                                    if ((inventoryHoverX <= 4) && (drag)) {
                                        dragEndIndex = (inventoryHoverX + (inventoryHoverY * 5));
                                        dragEnd();
                                    } else if ((inventoryHoverX == 6) && (inventoryHoverY == 2)) {
                                        var hoverIndex = 25;
                                        if ((storageObjects[storageGUI].data[hoverIndex].type == dragItem.type) && (storageObjects[storageGUI].data[hoverIndex].data == dragItem.data)) {
                                            dragItem.count += storageObjects[storageGUI].data[hoverIndex].count;
                                            storageObjects[storageGUI].data[hoverIndex].type = "";
                                            storageObjects[storageGUI].data[hoverIndex].data = 0;
                                            storageObjects[storageGUI].data[hoverIndex].count = 0;
                                            drag = true;
                                        };
                                        craftRecipe();
                                    } else if ((inventoryHoverX == 6) && (inventoryHoverY == 3)) {
                                        dragEndIndex = 26;
                                        dragEnd();
                                    } else {
                                        dragBack();
                                    };
                                    crafting();
                                    break;
                                case "smelting":
                                    if ((inventoryHoverX == 0) && (inventoryHoverY == 0)) {
                                        dragEndIndex = 0;
                                        dragEnd();
                                    } else if ((inventoryHoverX == 2) && (inventoryHoverY == 0)) {
                                        dragEndIndex = 1;
                                        dragEnd();
                                    } else if ((inventoryHoverX == 1) && (inventoryHoverY == 2)) {
                                        dragEndIndex = 2;
                                        dragEnd();
                                    } else if ((inventoryHoverX == 4) && (inventoryHoverY == 2)) {
                                        dragEndIndex = 3;
                                        dragEnd();
                                    } else if ((inventoryHoverX == 5) && (inventoryHoverY == 1)) {
                                        var hoverIndex = 4;
                                        if ((storageObjects[storageGUI].data[hoverIndex].type == dragItem.type) && (storageObjects[storageGUI].data[hoverIndex].data == dragItem.data)) {
                                            dragItem.count += storageObjects[storageGUI].data[hoverIndex].count;
                                            storageObjects[storageGUI].data[hoverIndex].type = "";
                                            storageObjects[storageGUI].data[hoverIndex].data = 0;
                                            storageObjects[storageGUI].data[hoverIndex].count = 0;
                                            drag = true;
                                        };
                                    } else if ((inventoryHoverX == 5) && (inventoryHoverY == 2)) {
                                        var hoverIndex = 5;
                                        if ((storageObjects[storageGUI].data[hoverIndex].type == dragItem.type) && (storageObjects[storageGUI].data[hoverIndex].data == dragItem.data)) {
                                            dragItem.count += storageObjects[storageGUI].data[hoverIndex].count;
                                            storageObjects[storageGUI].data[hoverIndex].type = "";
                                            storageObjects[storageGUI].data[hoverIndex].data = 0;
                                            storageObjects[storageGUI].data[hoverIndex].count = 0;
                                            drag = true;
                                        };
                                    };
                                    smelting();
                                    break;
                                case "drop":
                                    var side = Math.abs(cx - 512) / (cx - 512);
                                    for (var e = dragItem.count; e > 0; e--) {
                                        entityItems.push(new entity(dragItem.type, dragItem.data, relToAbs(sectorX, sectorY, px + side, py), 0, 0, 0, 0, g));
                                    };
                                    drag = false;
                                    dragItem = { type: "", data: 0, count: 0 };
                                    break;
                            };
                            updateEquippedItem();
                        };
                    };
                    if (storageGUI == 4) {
                        var hoverIndex = (inventoryHoverX + (inventoryHoverY * 14));
                        switch (helpPage) {
                            case 'crafting':
                                storageObjects[5] = new storage(helpPage, 27);
                                for (var i = 0; i < craftingRecipes[hoverIndex].data.length; i++) {
                                    storageObjects[5].data.splice(i, 1, craftingRecipes[hoverIndex].data[i]);
                                };
                                storageObjects[5].data[25] = (craftingRecipes[hoverIndex].output);
                                storageObjects[5].data[26] = (craftingRecipes[hoverIndex].tool);
                                break;
                            case 'smelting':
                                storageObjects[5] = new storage(helpPage, 6);
                                storageObjects[5].data[0] = smeltingRecipes[hoverIndex].input[0];
                                storageObjects[5].data[1] = smeltingRecipes[hoverIndex].input[1];
                                storageObjects[5].data[2] = { type: 'item', data: 44, count: 1 };
                                storageObjects[5].data[3] = smeltingRecipes[hoverIndex].cast;
                                storageObjects[5].data[4] = smeltingRecipes[hoverIndex].slag;
                                storageObjects[5].data[5] = smeltingRecipes[hoverIndex].output;
                                break;
                            case 'invcrafting':
                                storageObjects[5] = new storage(helpPage, 3);
                                var search = 0;
                                craftingRecipes.some(function (recipe) {
                                    if (recipe.type == 'conversion') {
                                        if (search == hoverIndex) {
                                            storageObjects[5].data[0] = recipe.data[0];
                                            storageObjects[5].data[1] = recipe.output;
                                            storageObjects[5].data[2] = recipe.tool;
                                            return true;
                                        } else {
                                            search++;
                                        };
                                    };
                                });
                                break;
                        };
                        click = false;
                        pauseRender = false;
                        storageGUI = 5;
                    };
                } else if (Math.sqrt((Math.abs(cx - 512) * Math.abs(cx - 512)) + (Math.abs(cy - 512) * Math.abs(cy - 512))) < (csDivVs * 4)) {
                    // mining
                    if (!((layer0[index(Math.round(mouse().x), Math.round(mouse().y))] == 0)||(layer0[index(Math.round(mouse().x), Math.round(mouse().y))] == 22))) {
                        mineLayer = 0;
                    } else if ((layer1[index(Math.round(mouse().x), Math.round(mouse().y))] != 0)||(layer1[index(Math.round(mouse().x), Math.round(mouse().y))] != 22)) {
                        mineLayer = 1;
                    } else { mineLayer = -1 };
                    blockMineUpdate = setInterval(mining, 10);
                };
                break;
        };
        //------------
        // Right Click
        //------------
    } else if (evt.which == 3) {
        switch (menu) {
            case 3:
                if (inventory) {
                    if (storageHoverIndex != 5) {
                        if (drag) {
                            var hoverIndex;
                            switch (storageObjects[storageHoverIndex].type) {
                                case "crafting":
                                    if (inventoryHoverX <= 4) {
                                        hoverIndex = (inventoryHoverX + (inventoryHoverY * 5));
                                    } else if ((inventoryHoverX == 6) && (inventoryHoverY == 2)) {
                                        hoverIndex = 25;
                                    } else if ((inventoryHoverX == 6) && (inventoryHoverY == 3)) {
                                        hoverIndex = 26;
                                    };
                                    break;
                                case "invcrafting":
                                    if ((inventoryHoverX == 0) && (inventoryHoverY == 0)) {
                                        hoverIndex = 0;
                                    } else if ((inventoryHoverX == 2) && (inventoryHoverY == 1)) {
                                        hoverIndex = 2;
                                    };
                                    break;
                                case "smelting":
                                    if ((inventoryHoverX == 0) && (inventoryHoverY == 0)) {
                                        hoverIndex = 0;
                                    } else if ((inventoryHoverX == 2) && (inventoryHoverY == 0)) {
                                        hoverIndex = 1;
                                    } else if ((inventoryHoverX == 1) && (inventoryHoverY == 2)) {
                                        hoverIndex = 2;
                                    } else if ((inventoryHoverX == 4) && (inventoryHoverY == 2)) {
                                        hoverIndex = 3;
                                    } else if ((inventoryHoverX == 5) && (inventoryHoverY == 1)) {
                                        hoverIndex = 4;
                                    } else if ((inventoryHoverX == 5) && (inventoryHoverY == 2)) {
                                        hoverIndex = 5;
                                    };
                                    smelting();
                                    break;
                                default: hoverIndex = (inventoryHoverX + (inventoryHoverY * 9));
                            };
                            if (storageObjects[storageHoverIndex].data[hoverIndex] != null) {
                                if (storageObjects[storageHoverIndex].data[hoverIndex].type == "") {
                                    storageObjects[storageHoverIndex].data[hoverIndex].type = dragItem.type;
                                    storageObjects[storageHoverIndex].data[hoverIndex].data = dragItem.data;
                                    storageObjects[storageHoverIndex].data[hoverIndex].count++;
                                    if (!((cx > 224) && (cx < 800) && (cy > 864) && (cy < 992))) {
                                        dragItem.count--;
                                    };
                                } else if ((storageObjects[storageHoverIndex].data[hoverIndex].type == dragItem.type) && (storageObjects[storageHoverIndex].data[hoverIndex].data == dragItem.data)) {
                                    storageObjects[storageHoverIndex].data[hoverIndex].count++;
                                    dragItem.count--;
                                };
                                if (dragItem.count <= 0) {
                                    dragItem = { type: "", data: 0, count: 0 };
                                    drag = false;
                                };
                                if (storageObjects[storageHoverIndex].type == "crafting") { crafting(); };
                            };
                        } else {
                            switch (storageObjects[storageHoverIndex].type) {
                                case "crafting":
                                    if (inventoryHoverX <= 4) {
                                        dragStartIndex = (inventoryHoverX + (inventoryHoverY * 5));
                                    } else if ((inventoryHoverX == 6) && (inventoryHoverY == 2)) {
                                        dragStartIndex = 25;
                                    } else if ((inventoryHoverX == 6) && (inventoryHoverY == 3)) {
                                        dragStartIndex = 26;
                                    } else {
                                        drag = false; dragItem = { type: "", data: 0, count: 0 };
                                    };
                                    break;
                                case "invcrafting":
                                    if ((inventoryHoverX == 0) && (inventoryHoverY == 0)) {
                                        dragStartIndex = 0;
                                    } else if ((inventoryHoverX == 2) && (inventoryHoverY == 1)) {
                                        dragStartIndex = 2;
                                    };
                                    crafting();
                                    break;
                                case "smelting":
                                    if ((inventoryHoverX == 0) && (inventoryHoverY == 0)) {
                                        dragStartIndex = 0;
                                    } else if ((inventoryHoverX == 2) && (inventoryHoverY == 0)) {
                                        dragStartIndex = 1;
                                    } else if ((inventoryHoverX == 1) && (inventoryHoverY == 2)) {
                                        dragStartIndex = 2;
                                    } else if ((inventoryHoverX == 4) && (inventoryHoverY == 2)) {
                                        dragStartIndex = 3;
                                    } else if ((inventoryHoverX == 5) && (inventoryHoverY == 1)) {
                                        dragStartIndex = 4;
                                    } else if ((inventoryHoverX == 5) && (inventoryHoverY == 2)) {
                                        dragStartIndex = 5;
                                    };
                                    smelting();
                                    break;
                                default: dragStartIndex = (inventoryHoverX + (inventoryHoverY * 9));
                            };
                            if ((storageObjects[storageHoverIndex].data[dragStartIndex].type != "") && (storageObjects[storageHoverIndex].data[dragStartIndex].count > 1)) {
                                dragItem.type = storageObjects[storageHoverIndex].data[dragStartIndex].type;
                                dragItem.data = storageObjects[storageHoverIndex].data[dragStartIndex].data;
                                dragItem.count = Math.ceil(storageObjects[storageHoverIndex].data[dragStartIndex].count / 2);
                                storageObjects[storageHoverIndex].data[dragStartIndex].count = Math.floor(storageObjects[storageHoverIndex].data[dragStartIndex].count / 2);
                                drag = true;
                            };
                            if (storageObjects[storageHoverIndex].type == "crafting") { crafting(); };
                        };
                    };
                } else if (Math.sqrt((Math.abs(cx - 512) * Math.abs(cx - 512)) + (Math.abs(cy - 512) * Math.abs(cy - 512))) < (csDivVs * 4)) {
                    var selectedIndex = index(Math.round(mouse().x), Math.round(mouse().y));
                    var type = equippedItem.data;
                    // open storageObjects
                    if ((layer0[selectedIndex] == 10) || ((layer1[selectedIndex] == 10))) {
                        storageObjects.some(function (element, i) {
                            if (i > 5) {
                                var coord = relToAbs(sectorX, sectorY, Math.round(mouse().x), Math.round(mouse().y));
                                if ((element.coord[0] == coord[0]) && (element.coord[1] == coord[1])) {
                                    storageGUI = i;
                                    inventory = true;
                                    pausePhysics = true;
                                    return true;
                                };
                            };
                        });
                    } else if ((layer0[selectedIndex] == 11) || ((layer1[selectedIndex] == 11))) {
                        storageObjects.some(function (element, i) {
                            if (i > 5) {
                                var coord = relToAbs(sectorX, sectorY, Math.round(mouse().x), Math.round(mouse().y))
                                if (element.coord != undefined && (element.coord[0] == coord[0]) && (element.coord[1] == coord[1])) {
                                    storageGUI = i;
                                    inventory = true;
                                    pausePhysics = true;
                                    return true;
                                };
                            };
                        });
                    } else if ((layer0[selectedIndex] == 14) || ((layer1[selectedIndex] == 14))) {
                        storageObjects.some(function (element, i) {
                            if (i > 5) {
                                var coord = relToAbs(sectorX, sectorY, Math.round(mouse().x), Math.round(mouse().y))
                                if ((element.coord[0] == coord[0]) && (element.coord[1] == coord[1])) {
                                    storageGUI = i;
                                    inventory = true;
                                    pausePhysics = true;
                                    return true;
                                };
                            };
                        });
                    };
                    if ((index(Math.round(px), Math.round(py + 0.5)) != selectedIndex) && (index(Math.round(px), Math.round(py - 0.5)) != selectedIndex)) {
                        // toggle doors
                        // Bottom open
                        if ([29].indexOf(layer0[selectedIndex]) != -1) {
                            switch (layer0[selectedIndex]) {
                                case 29: layer0[selectedIndex] = 27; layer0[index(Math.round(mouse().x), Math.round(mouse().y - 1))] = 28; break;
                            };
                            // top open
                        } else if ([30].indexOf(layer0[selectedIndex]) != -1) {
                            switch (layer0[selectedIndex]) {
                                case 30: layer0[selectedIndex] = 28; layer0[index(Math.round(mouse().x), Math.round(mouse().y + 1))] = 27; break;
                            };
                            // Bottom closed
                        } else if ([27].indexOf(layer0[selectedIndex]) != -1) {
                            switch (layer0[selectedIndex]) {
                                case 27: layer0[selectedIndex] = 29; layer0[index(Math.round(mouse().x), Math.round(mouse().y - 1))] = 30; break;
                            };
                            // top closed
                        } else if ([28].indexOf(layer0[selectedIndex]) != -1) {
                            switch (layer0[selectedIndex]) {
                                case 28: layer0[selectedIndex] = 30; layer0[index(Math.round(mouse().x), Math.round(mouse().y + 1))] = 29; break;
                            };
                        };
                        // interact with bed
                        if ([31, 32].indexOf(layer0[selectedIndex]) != -1) {
                            playerStats.fatigue = 100;
                        };
                        // place blocks
                        storageObjects[1].data.some(function (element) {
                            if ((element.count > 0) && (element.data == type)) {
                                if ((!keyMap[16] && (fluids.indexOf(layer0[selectedIndex]) != -1)) ||
                                    (keyMap[16] && (fluids.indexOf(layer1[selectedIndex]) != -1))) {
                                    switch (element.type) {
                                        case 'block':
                                            if ([53].indexOf(type) != -1) {
                                                if (blockTypeDirt.indexOf(textNamesBlocks[layer0[index(Math.round(mouse().x), Math.round(mouse().y) + 1)]]) != -1) {
                                                    layer0[selectedIndex] = type;
                                                    saplings.push({ x: Math.round(mouse().x), y: Math.round(mouse().y) });
                                                    element.count--;
                                                };
                                            } else {
                                                if (([37, 39, 41, 43, 45].indexOf(type) != -1) && (Math.round(mouse().x) < mouse().x)) {
                                                    type++;
                                                };
                                                if (keyMap[16]) {
                                                    layer1[selectedIndex] = type;
                                                } else {
                                                    if ([10, 11, 14].indexOf(layer1[selectedIndex]) == -1) {
                                                        layer0[selectedIndex] = type;
                                                    };
                                                };

                                                switch (type) {
                                                    case 10: storageObjects.push(new storage("chest", 63, relToAbs(sectorX, sectorY, Math.round(mouse().x), Math.round(mouse().y)))); break;
                                                    case 11: storageObjects.push(new storage("crafting", 27, relToAbs(sectorX, sectorY, Math.round(mouse().x), Math.round(mouse().y)))); break;
                                                    case 14: storageObjects.push(new storage("smelting", 6, relToAbs(sectorX, sectorY, Math.round(mouse().x), Math.round(mouse().y)))); break;
                                                };
                                                element.count--;
                                                // experience
                                                playerSkills.construction += 1;
                                            };
                                            break;
                                        case 'item':
                                            switch (type) {
                                                case 48:
                                                    // Bed
                                                    if (fluids.indexOf(layer0[index(Math.round(mouse().x + 1), Math.round(mouse().y))]) != -1) {
                                                        layer0[selectedIndex] = 31;
                                                        layer0[index(Math.round(mouse().x + 1), Math.round(mouse().y))] = 32;
                                                    } else if (fluids.indexOf(layer0[index(Math.round(mouse().x - 1), Math.round(mouse().y))]) != -1) {
                                                        layer0[index(Math.round(mouse().x - 1), Math.round(mouse().y))] = 31;
                                                        layer0[selectedIndex] = 32;
                                                    };
                                                    element.count--;
                                                    // experience
                                                    playerSkills.construction += 1;
                                                    break;
                                                case 59:
                                                    // Elm door
                                                    if (fluids.indexOf(layer0[index(Math.round(mouse().x), Math.round(mouse().y - 1))]) != -1) {
                                                        layer0[selectedIndex] = 29;
                                                        layer0[index(Math.round(mouse().x), Math.round(mouse().y - 1))] = 30;
                                                    } else if (fluids.indexOf(layer0[index(Math.round(mouse().x), Math.round(mouse().y + 1))]) != -1) {
                                                        layer0[index(Math.round(mouse().x), Math.round(mouse().y + 1))] = 29;
                                                        layer0[selectedIndex] = 30;
                                                    };
                                                    element.count--;
                                                    // experience
                                                    playerSkills.construction += 1;
                                                    break;
                                            };
                                            break;
                                    };
                                    if (element.count == 0) {
                                        element.type = "";
                                        storageObjects[2].data[selectionIndex[equipmentIndex] + (equipmentIndex * 9)].count = 0;
                                        updateEquippedItem();
                                    };
                                    return true;
                                };
                            };
                        });
                    };
                    // search for food
                    if (food[textNamesItems[type]] != undefined) {
                        if (playerStats.hunger < 100) {
                            playerStats.hunger += food[textNamesItems[type]];
                            if (playerStats.hunger > 100) {
                                playerStats.hunger = 100;
                            };
                        };
                    };
                    // drink water
                    if (layer0[selectedIndex] == 22) {
                        playerStats.thirst = 100;
                    };
                };
        };
    };
    evt.preventDefault();
	evt.stopPropagation();
    evt.cancelBubble = true;
    return false;
    clickLast = false;
});
window.addEventListener("mouseup", function (evt) {
    click = false;
    if (evt.which == 1) {
        switch (menu) {
            case 3: buttonLast = true;
                // sprite animation
                plrArmAction = false;
                clearInterval(plrArmUpdate);
                plrArmx = plrBodyx + 4;
                plrArmy = plrBodyy;
                // mining
                clearInterval(blockMineUpdate);
                plrArmRot = 0;
                clearInterval(blockCrackUpdate);
                mineability = true;
                blockCrackX = 0;
                break;
        };
    };
    clickLast = true;
    // browser
    evt.preventDefault();
	evt.stopPropagation();
    evt.cancelBubble = true;
    return false; 
});
window.addEventListener("mousewheel", function (evt) {
    switch (menu) {
        case 3:
            var cycle;
            if (keyMap[16]) {
                cycle = equipmentIndex;
            } else {
                cycle = selectionIndex[equipmentIndex];
            };
            if (evt.wheelDelta < 0) {
                if (cycle < 8) {
                    cycle++;
                } else {
                    cycle = 0;
                };
            };
            if (evt.wheelDelta > 0) {
                if (cycle > 0) {
                    cycle--;
                } else {
                    cycle = 8;
                };
            };
            if (keyMap[16]) {
                equipmentIndex = cycle;
            } else {
                selectionIndex[equipmentIndex] = cycle;
            };
            updateEquippedItem();
            break;
    };
    evt.preventDefault();
});
window.addEventListener("load", function (evt) {
    updateMenu();
});