//var xpos = 50;
//var xspeed = 3;
var xaccel = 0;
//var ypos = 500;
//var yspeed = -3;
var yaccel = .1;
var canvasName = "myCanvas";
var numberOfBalls = 30;
var b;
var timeOfLastFrame = Date.now();
var lastColor = 0;

function Ball(canvasNameString, ballArray) {
    function random(min, max, negable) {
        var out = Math.random() * (max - min);
        out += min;
        return (negable) ? (((Math.random() > .5) ? -1 : 1) * out) : out;
    }
    this.collided = false;
    this.number = ballArray.length;
    this.ballArray = ballArray;
    this.xaccel = xaccel;
    this.yaccel = 100;
    this.xMaxSpeed = 600;
    this.yMaxSpeed = 600;
    var canvas = document.getElementById(canvasNameString);
    this.xpos = Math.random() * canvas.width;
    this.ypos = Math.random() * canvas.height;
    this.xspeed = random(0, 300, true);
    this.yspeed = random(0, 300, true);
    this.canvasName = canvasNameString;
    //this.color = Math.random() * 255;
	this.color = lastColor;
	lastColor += (255 / numberOfBalls);
    this.radius = random(20, 60, false);
    //this.mass = 4 * Math.PI * Math.pow(this.radius, 2); //sphere volume formula
    this.mass = Math.PI * Math.pow(this.radius, 2);
    this.touch = function(timeDelta){
        timeDelta /= 1000;
	    timeDelta = .03; //fixed time delta
        var c = canvas.getContext('2d');
	    this.xpos += this.xspeed * timeDelta;
        this.ypos += this.yspeed * timeDelta;
	    this.xspeed += this.xaccel * timeDelta;
        this.yspeed += this.yaccel * timeDelta;
        if (this.xspeed > this.xMaxSpeed) this.xspeed -= (this.xspeed - this.xMaxSpeed) / 2;
        if (this.yspeed > this.yMaxSpeed) this.yspeed -= (this.yspeed - this.yMaxSpeed) / 2;
        if (this.xpos > canvas.width - this.radius) this.xspeed = Math.abs(this.xspeed) * -1;
	    if (this.xpos < this.radius) this.xspeed = Math.abs(this.xspeed);
        if (this.ypos > canvas.height - this.radius) this.yspeed = Math.abs(this.yspeed) * -1;
        if (this.ypos < this.radius) this.yspeed = Math.abs(this.yspeed);
	    c.fillStyle = "hsl(" + this.color + ", 100%, 50%)";
        circle(this.xpos, this.ypos, this.radius);
        collisionDetect(this, this.ballArray);
	}
    function circle(x, y, r){
        var c = canvas.getContext('2d');
        c.beginPath();
        c.arc(x, y, r, 0, 2 * Math.PI, false);
        c.fill();
    }
    function collisionDetect(caller, ballArray) {
        var out = false;
        var HALF_PI = Math.PI / 2;
        var TWO_PI = 2 * Math.PI;
        for (var i = (caller.number + 1); i < ballArray.length; i ++) {
            var b2 = ballArray[i];
            var yComponent = caller.ypos - b2.ypos;
            var xComponent = caller.xpos - b2.xpos;
            var distance = Math.sqrt(Math.pow(xComponent, 2) + Math.pow(yComponent, 2));
            var radi = caller.radius + b2.radius;
            if (distance <= radi) {
                console.log("Collsion detected between: " + caller.number + " and " + b2.number);
                out = true;

                //Find velocities. 
                var Vm1 = speed(caller.xspeed, caller.yspeed);
                var Vd1 = angle(caller.xspeed, caller.yspeed);

                var Vm2 = speed(b2.xspeed, b2.yspeed);
                var Vd2 = angle(b2.xspeed, b2.yspeed);

                var phi = angle(xComponent, yComponent);
                phi += Math.PI;
                if (phi > (2 * Math.PI)) phi -= (2 * Math.PI);

                //holy crap on a stick, here comes the math!!!
                caller.xspeed = ((((Vm1 * Math.cos(Vd1 - phi) * (caller.mass - b2.mass)) + (2 * b2.mass * Vm2 * Math.cos(Vd2 - phi))) / (caller.mass + b2.mass)) * Math.cos(phi)) + ((Vm1 * Math.sin(Vd1 - phi) * Math.cos(phi + HALF_PI)));
                caller.yspeed = ((((Vm1 * Math.cos(Vd1 - phi) * (caller.mass - b2.mass)) + (2 * b2.mass * Vm2 * Math.cos(Vd2 - phi))) / (caller.mass + b2.mass)) * Math.sin(phi)) + ((Vm1 * Math.sin(Vd1 - phi) * Math.sin(phi + HALF_PI)));

                b2.xspeed = ((((Vm2 * Math.cos(Vd2 - phi) * (b2.mass - caller.mass)) + (2 * caller.mass * Vm1 * Math.cos(Vd1 - phi))) / (b2.mass + caller.mass)) * Math.cos(phi)) + ((Vm2 * Math.sin(Vd2 - phi) * Math.cos(phi + HALF_PI)));
                b2.yspeed = ((((Vm2 * Math.cos(Vd2 - phi) * (b2.mass - caller.mass)) + (2 * caller.mass * Vm1 * Math.cos(Vd1 - phi))) / (b2.mass + caller.mass)) * Math.sin(phi)) + ((Vm2 * Math.sin(Vd2 - phi) * Math.sin(phi + HALF_PI)));
            }
        }
        return out;
    }
    function speed(x, y) {
        //debugger;
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    }
    function angle(x, y) {
        var out = (x != 0) ? Math.atan(y / x) : (Math.PI / 2);
        if (x < 0) out -= Math.PI;
        if (out < 0) out += 2 * Math.PI;
        return out;
    } 
}

window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

function resizeCanvas() {
    var canvas = document.getElementById("myCanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
function animate() {
    var timeSinceLastFrame = Date.now() - timeOfLastFrame;
    timeOfLastFrame = Date.now();

    var canvas = document.getElementById("myCanvas");
    var c = canvas.getContext('2d');
    c.fillStyle = "rgba(0, 0, 0, .1)";
    c.fillRect(0, 0, canvas.width, canvas.height);
    
    var elt = document.getElementById("framerate");
    elt.innerHTML = 1000 / timeSinceLastFrame;

    for (i = 0; i < b.length; i ++){
        b[i].touch(timeSinceLastFrame);
    }     
    // request new frame
    requestAnimFrame(function () {
        animate();
    });   
}
window.onload = function () { 
	b = [];
    for (i = 0; i < numberOfBalls; i ++) { 
	    b.push(new Ball("myCanvas", b));
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, false);
	animate();
}
