/**
 * @author Chase
 */

var address = "http://beards.zapto.org:1337";


console.log("hello world");
var audioUnacceptable = new Audio('Unnacceptable.mp3');
var audioMoan = new Audio('moan.mp3');

var colors = ['blue', 'red', 'green', 'violet', 'orange', 'brown', 'Chartreuse', 'cyan', 'magenta', 'crimson'];
var color = 0;

var gameField = document.getElementById('gameField');
var letterField = document.getElementById('letters');
var textField = document.getElementById('textInput');
var bonusField = document.getElementById('bonus');
var timeField = document.getElementById('time');
var messageField = document.getElementById('message');
var playerTable = document.getElementById('playerTable');
var word = "";
var name = "";
var token = "";

var timer = null;
var endTime;

var requests = 0;



function displayTime(){
    var time = Math.floor((endTime - (new Date().getTime())) / 1000);
    var displayTime;
    if (time > 59) {
        var minute = Math.floor(time / 60);
        var second = time - (minute * 60);
        timeField.innerText = " " + minute + ":" + ((second > 9) ? second : ("0" + second));
    } else {
        timeField.innerText = " 0:" + ((time > 9) ? time : ("0" + time));
    }
    if (time <= 0) {
        clearInterval(timer);
        timer = null;
    }
    
}

function updateTime(time){
    time = parseInt(time, 10) * 1000;
    var now = new Date().getTime();
    endTime = now + time;
    if (timer == null) {
        timer = setInterval(displayTime, 1000);
    }
    displayTime();
}



var queryNumber = 0; //workaround for double submit bug.
                    //just needs something to prevent 2 identical get queries
function submit(ins){
    if (ins == '') {
        return;
    }
    console.log(ins);
    var request = new XMLHttpRequest();
    
    request.open("get", address + "?token=" + token + ":word=" + ins + ":qn=" + (queryNumber ++), true);
    request.addEventListener("load", processResponse);
    request.send();
    requests ++;
}




textField.addEventListener("keydown", function (event) {

    if (event.keyCode == 8) {
        //backspace
        return;
    }
    
    
    var upperWord = word.toLocaleUpperCase();
    
    if ((event.keyCode >= 65) && (event.keyCode <= 90)) {
        if (upperWord.indexOf(String.fromCharCode(event.keyCode)) < 0) {
            shake();
            event.preventDefault();
            return false;
        }

    } else {
        event.preventDefault();
    }
    
    if (event.keyCode == 13) {
        //enter
        submit(textField.value);
        textField.value = "";
        return false;
    }
}, false);

var wordList = [];

function findPlayerIndex(name){
    var out = -1;
    playerList.forEach(function (ele, index) {
        if (ele.equals(name)){
            out = index;
            return false;
        }
    });
    return out;
}

function findPlayer(name){
    var out = -1;
    playerList.forEach(function (ele) {
        if (ele.equals(name)){
            out = ele;
            return false;
        }
    });
    return out;
}

var bonusLetter;

function setupRound(inword, inBonusLetter, words){
    word = inword;
    bonusLetter = inBonusLetter;
    letterField.innerText = inword.split("").join(" "); //addes spaces between letters
    bonusField.innerText = bonusLetter;
    
    gameField.innerHTML = ''; //clear the existing game field
    
    words = words.split(',');
    
    var output = "";
    wordList = [];
    
    words.forEach(function (ele, index) {
        var word = ele.split(".");
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(word[0]));
        div.style.color = findPlayer(word[1]).color;
        wordList.push({word: word, element: div});
        gameField.appendChild(div);
    });
    
    textField.focus();
}



function updateWord(position, word, finder){
    wordList[position].word = word;
    wordList[position].element.innerText = word;
    
    wordList[parseInt(position, 10)].element.style.color = findPlayer(finder).color;
    
}


function endRound(words) {
    setupRound(word, bonusLetter, words);
    word = "";
}

var playerList = [];
var playerAside = document.getElementById("players");

//Object player
function Player(inName, inScore, inBonus, number){
    
    this.color = colors[color];
    color ++;
    if (color >= colors.length) {
        color = 0;
    }
    
    var name = inName;
    //this.name = name;
    var score = parseInt(inScore, 10);
    var bonus = parseInt(inBonus, 10);
    
    var element = document.createElement("tr");
    //element.id = "player" + name;
    var textNode = document.createTextNode("");
    
    element.appendChild(textNode);
    playerTable.appendChild(element);
    
    var update = function(){
        element.innerHTML = "<td>" + name + "</td><td>" + score +
            "</td><td>" + bonus + "</td><td>" + (score + bonus) + "</td>";
        //element.innerText = name + ":" + score + " + (" + bonus + ") = " + (score + bonus);
    };
    
    update();

    element.style.color = this.color;

    this.equals = function (inName) {
        return inName == name;
    };
    
    /**
     * Sets the score
     * if a 2nd parameter is given, only updates if the player name matches it
     */
    this.setScore = function (inScore, inBonus, name) {
        if (this.equals(name)) {
            score = parseInt(inScore, 10);
            bonus = parseInt(inBonus, 10);
            update();
            return true;
        } else {
            return false;
        }
    };
    
    this.getScore = function () {
        return score;
    };
    

    
    var remove = function(){
        playerTable.removeChild(element);
    };
    
    /**
     * Removes the player.
     * if a name is given, then it will only remove the player's name matches
     * returns true if player was successfully removed
     */
    this.remove = function (inName) {
        if (this.equals(inName)) {
            remove();
            return true;
        } else {
            return false;
        }
        
    };
}


function addPlayer(name, score, bonus){
    playerList.push(new Player(name, score, bonus, playerList.length + 1));
}


function removePlayer(name){
    for (var i = 0; i < playerList.length; i ++) {
        if (playerList[i].remove(name)){
            playerList.splice(i, 1);
            return;
        }
    }
}

function updatePlayer(name, score, bonus){
    playerList.forEach(function (ele) {
        if (ele.setScore(score, bonus, name)) {
            return false;
        }
    });
}

function displayMessage(inMessage){
    gameField.innerText = inMessage;
}



function processResponse(XHRresponse){
    requests --;
    var response = XHRresponse.srcElement.responseText;
    console.log("XHR Load: " + response);
    
    response.split(":").forEach(function (message) {
        var parts = message.split(";");
        
        switch (parts[0]) {
            case 'bell':
                unacceptable();
                break;
                
            case 'startRound' :
                setupRound(parts[1], parts[2], parts[3]);
                break;
                
            case 'updateWord' :
                updateWord(parts[1], parts[2], parts[3]);
                break;
                
            case 'endRound' :
                endRound(parts[1]);
                break;
                
            case 'updateScore' :
                updatePlayer(parts[1], parts[2], parts[3]);
                break;
                
            case 'addPlayer' :
                addPlayer(parts[1], parts[2], parts[3]);
                break;
                
            case 'removePlayer' :
                removePlayer(parts[1]);
                break;
                
            case 'accept' :
                name = parts[1];
                token = parts[2];
                document.getElementById("login").style.visibility = "hidden";
                window.addEventListener("click", function () {
                    textField.focus();
                });
                break;
                
            case 'time' :
                updateTime(parts[1]);
                break;
               
            case 'message' :
                displayMessage(parts[1]);
                break;
                
            case 'heartbeat' :
                break;
                
            case 'error' :
                throw new Error(parts[1]);
                return;
                
            default:
                console.log("command " + message + " not identified");
        }
    
    });
    
    if (requests <= 0) {
        fetchCommand();
    }
}



function fetchCommand(){
    var request = new XMLHttpRequest();
    
    request.open("get", address + "?token=" + token, true);
    request.addEventListener("load", processResponse);
    request.addEventListener("error", function (event) {
        messageField.innerText = "Server Connection Error:" + request.statusText;
        messageField.style.visibility = 'visible';
    });
    request.send();
    requests ++;
    console.log("sending fetchcommand");
}

function login(loginName){
    var requestedName = loginName; //TODO: Sanitize this!
    
    var request = new XMLHttpRequest();
    
    request.open("get", address + "?requestName=" + requestedName, true);
    request.addEventListener("load", processResponse);
    request.addEventListener("error", function (event) {
        messageField.innerText = "Server Connection Error:" + request.statusText;
        messageField.style.visibility = 'visible';
    });
    request.send();
    requests ++;
}

var loginId = document.getElementById("loginId");

loginId.addEventListener("keyup", function (event) {
    if (event.keyCode == 13) {
        login(loginId.value);
    }

});

loginId.focus();


function unacceptable(){
    console.log("unacceptable");
    var element = document.getElementById("lemongrabMouth");
    
    audioUnacceptable.play();
    element.parentElement.style.visibility = 'visible';
    element.style.webkitAnimationName = 'unacceptable';
    
    element.addEventListener('webkitAnimationEnd', function(){
        this.style.webkitAnimationName = '';
        this.parentElement.style.visibility = 'hidden';
    }, false);
}

function shake(){
    audioMoan.play();
    
    var element = document.getElementById("textInput");
    element.style.webkitAnimationName = 'shake';
    
    element.addEventListener('webkitAnimationEnd', function(){
        element.style.webkitAnimationName = '';
    }, false);
}

window.addEventListener("beforeunload", function (event){
    var request = new XMLHttpRequest();
    
    request.open("get", address + "?token=" + token + ":" + "exit=true", true);
    request.send();
});
