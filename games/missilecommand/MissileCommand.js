'use strict';
// Game:        Missile Command
// Developer:   Gage Coates (sg_p4x347)
// Date:        March, 2015 - present
// Synopsis:    The classic graphing calculator game of Missile Command.

document.oncontextmenu = function () {
    return false;
};

//----------
// Variables
//----------

var canvas=document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");
// image interpolation off for IE, Chrome, Firefox
ctx['msImageSmoothingEnabled'] = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;

var cs = 128;
var vs = 128;
var ww = 128;
var wh = 128;
var x;
var y;
var px = 64;
var py = 64;
var csDiv2 = cs / 2;
var vsDiv2 = vs / 2;
var csDivVs = cs / vs;
var halfCsDivVs = csDivVs / 2;
var surface = [];
var inGame = true;
ctx.font = "italic small-caps bold 20px arial";

var pauseRender = false;
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

//------
// World
//------

var playerCoords = newFilledArray(16,0);
var world = newFilledArray(16384,0);
var base = [
2, 2, 2, 2, 2,
2, 2, 2, 2, 2,
2, 2, 2, 2, 2
];
function generator(roughness) {
    // get the points
    surface = terrain(ww, wh, wh / 4, roughness);
    // draw the points
    for (var t = 1; t < surface.length; t++) {
        var stone = 0;
        while ((Math.round(surface[t]) + stone) <= wh) {
            world.splice(index(t, Math.round(surface[t]) + stone), 1, 1);
            stone++;
        };
    };
};
function spawnBases(count) {
	var space = ww/ (count+1);
	for (var i = 1; i <= count; i++) {
	    if (i == 1) {
	        var xLoc = Math.round(Math.random() * 20) + 3;
	    } else if (i == count) {
	        var xLoc = ww - (Math.round(Math.random() * 20) + 3);
	    } else {
	        var xLoc = Math.round((space * i) + (Math.random() * 10));
	    };
	    playerCoords[i] = Math.round(xLoc);
	    var yLoc = Math.round(surface[xLoc]);
	    // create structure	
	    var topleft = [(xLoc - 2), (yLoc - 2)];
	    var Index = 0;
	    for (y = topleft[1]; y < topleft[1] + 3; y++) {
	        for (x = topleft[0]; x < topleft[0] + 5; x++) {
	            world[index(x, y)] = i +1;
	            Index++;
	        };
	    };
	};
};


//-------
// Render
//-------

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
                //var texture = new Image();
                var blockType = world[index(x, y)];
                switch (blockType) {
                    case 1: ctx.fillStyle = "rgb(0,0,0)"; break;
                    case 2: ctx.fillStyle = "rgb(0,0,128)"; break;
                    case 3: ctx.fillStyle = "rgb(128,0,0)"; break;
                    case 4: ctx.fillStyle = "rgb(0,128,0)"; break;
                    case 5: ctx.fillStyle = "rgb(0,128,128)"; break;
                    case 6: ctx.fillStyle = "rgb(128,128,0)"; break;
                    case 7: ctx.fillStyle = "rgb(128,128,128)"; break;
                };
                if (blockType != 0) {
                    ctx.fillRect(Math.round(((x - currentLeft) * csDivVs) - halfCsDivVs), yCoord, csDivVs, csDivVs);
                };
            };
        };
        playerColor(player);
        switch (inputCycle) {
            case 0: ctx.fillText('angle', 0, 32); break;
            case 1: ctx.fillText('power', 0, 32); break;
            case 2: ctx.fillText('next!', 0, 32); break;
        };
        if (inputCycle != 2) {
            ctx.fillText(input, 0, 64);
        };
    };
};
// get the exact top left game coordinate of the view
function topLeft() {
    return {
        x: (px-vsDiv2),
        y: (py-vsDiv2)
    };
};
function playerColor(player) {
    switch (player) {
        case 1: ctx.fillStyle = "rgb(0,0,128)"; break;
        case 2: ctx.fillStyle = "rgb(128,0,0)"; break;
        case 3: ctx.fillStyle = "rgb(0,128,0)"; break;
        case 4: ctx.fillStyle = "rgb(0,128,128)"; break;
        case 5: ctx.fillStyle = "rgb(128,128,0)"; break;
        case 6: ctx.fillStyle = "rgb(128,128,128)"; break;
    };
};

//--------
// Physics
//--------

var t = 0.016;
var mx;
var my;
var mxvel=0;
var myvel=0;
function displacement(velocity, acceleration) {
    return (velocity * t) + (0.5 * acceleration * (t * t));
};
function missile() {
    mx += displacement(mxvel, 0);
    my += displacement(myvel, 9.8);
    myvel = myvel + (9.8 * t);
    playerColor(player);
    ctx.fillRect(mx, my, 1, 1);
    collide();
};
// collision
var collision = false;
function collide() {
    if ((world[index(Math.round(mx),Math.round(my))] != 0 )||(mx > ww)||(mx <0)||(my>wh)||(my<0)) {
        clearInterval(physicsUpdate);
        destruction(4, 4);
        render();
        inspectBases();
        var playersLeft = 0;
        for (var i = 0; i <= numOfPlayers; i++) {           
            if (playerCoords[i] != 0) {
                playersLeft++;
            };
        };
        if (playersLeft <= 1) {
            playerCoords.some(function (coord, i) {
                if (coord != 0) {
                    playerColor(i);
                    ctx.fillRect(0, 0, 128, 128);
                    return true;
                };
            });
            inGame = false;
        };
        collision = true;
    };
};

//--------
// Terrain
//--------

var surface = terrain(64,64,16,0.55);
function terrain(width, height, displace, roughness, middle) {
    var points = [];
    // Gives a power of 2 based on width

    //var power = Math.ceil(Math.log(width) / (Math.log(2)));
    //power = power * power;
    var power = Math.pow(2, Math.ceil(Math.log(width) / (Math.log(2))));
    // Set the initial left point
    points[0] = height - (height / 4);
    // set the initial right point
    points[power] = height - (height / 4);
    displace *= roughness;
    // Increase the number of segments
    for (var i = 1; i < power; i *= 2) {
        // Iterate through each segment calculating the center point
        // set the middle point, if necessary
        for (var j = (power / i) / 2; j < power; j += power / i) {
            points[j] = ((points[j - (power / i) / 2] + points[j + (power / i) / 2]) / 2);
            points[j] += (Math.random() * displace * 2) - displace
        };
        // reduce the random range
        displace *= roughness;
    };
    return points;
};
// destruction
function destruction(width, height) {
    var aSqrd = width * width;
    var bSqrd = height * height;
    for (y = my - height; y < (my + height); y++) {
        for (x = mx - width; x < (mx + width); x++) {
            if (((((x - mx) * (x - mx)) / aSqrd) + (((y - my) * (y - my)) / bSqrd)) <= 1) {
                if (world[index(Math.round(x), Math.round(y))] != 0) {
                    if (world[index(mx, my)]) {
                        playerCoords[world[index(mx, my)] - 1] = 0;
                    };
                    world.splice(index(Math.round(x), Math.round(y)), 1, 0);
                };
            };
        };
    };
};

//----
// UI
//----

var angle = 0;
var power = 0;
var physicsUpdate;
var player = 1;
var numOfPlayers = 6;
function updatePlayer() {
    render();
    switch (inputCycle) {
        case 0:
            if (keyMap[13]) {
                angle = (Math.PI / (180 / input)) / -1;
                input = 0;
            };
            break;
        case 1:
            if (keyMap[13]) {
                power = input;
                playerTurn();
                mxvel = Math.cos(angle) * power;
                myvel = Math.sin(angle) * power;
                physicsUpdate = setInterval(missile, t);
            };
            break;
        case 2:
            input = 90;
            if (player < numOfPlayers) {
                player++;
                while (playerCoords[player] == 0) {
                    player++;
                };
            } else {
                player = 1;
                while (playerCoords[player] == 0) {
                    player++;
                };
            };
            break;
    };
    var max;
    if (inputCycle == 0) {
        max = 180;
    } else if (inputCycle == 1) {
        max = 100;
    };
    if (keyMap[65]) {
        if (input <= 0) {
            input = 0;
        } else {
            input--;
        };
    } else if (keyMap[68]) {
        if (input >= max) {
            input = max;
        } else {
            input++;
        };
    };
    if (keyMap[13]) {
        if (inputCycle < 2) {
            inputCycle++;
        } else if (collision) {
            inputCycle = 0;
        };
    };
};
function playerTurn() {
    mx = playerCoords[player];
    my = surface[playerCoords[player]] - 3;
};
function inspectBases() {
    for (var i = 1; i <= numOfPlayers; i++) {
        if (playerCoords[i] != 0) {
            for (y = surface[playerCoords[i]] - 1; y < surface[playerCoords[i]]; y++) {
                for (x = playerCoords[i] - 1; x < playerCoords[i] + 1; x++) {
                    if (world[index(Math.round(x), Math.round(y))] == 0) {
                        playerCoords[i] = 0;
                        return true;
                    };
                };
            };
        };
    };
};

//----------------
// Event Listeners
//----------------

var inputCycle = 0;
var keyMap = newFilledArray(100, false);
var input = 90;
var cx;
var cy;
window.addEventListener("mousemove", function (evt) {
    cx = getMousePos(canvas, evt).x;
    cy = getMousePos(canvas, evt).y;
});
window.addEventListener("keydown", function (evt) {
    keyMap.splice(evt.keyCode, 1, true);
    if (inGame) {
        updatePlayer();
        render();
    };
    evt.preventDefault();
    evt.stopPropagation();
    evt.cancelBubble = true;
    return false;
});
window.addEventListener("keyup", function (evt) {
    keyMap.splice(evt.keyCode, 1, false);
    
});
generator(0.55);
spawnBases(numOfPlayers);
updatePlayer();
