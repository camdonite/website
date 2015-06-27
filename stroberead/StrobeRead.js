function changeWPM() {
	console.log(jQuery('#WPM')[0].value);
	reader.setWPM(parseInt(jQuery('#WPM')[0].value, 10));
	
}

var strobeRead = function (selector, display) {
	this.selector = (selector) ? selector : ".read";
	this.display = (display) ? display : "#reader";
	var rewind = 5; //default amout to go back and forth
	var showWord = true;
	var commaWait = 300;
	var periodWait = 500;
	var blockWait = 1000;
	var initWait = 1000;
	var cpm = 250 * 5; //characters per minute. It's wpm devided by 5
	var blocks = []; //array of string arrays holding each of the elements with the class="read"
	var block = 0; //current block
	var word = 0; // current word within block
	var reader; //the element that will display the words
	var reads = []; //stores all the elements of the read class
	var timer;
	var started = true;

	this.setCPM = function (value) {
		cpm = value;
	}

	this.setWPM = function (value) {
		cpm = value * 5;
	}

	this.toggle = function () {
		if (started) {
			this.stop();
		} else {
			this.start();
		}
	}

	this.stop = function () {
		started = false;
	}

	this.start = function () {
		timer = window.setTimeout(displayWord, initWait);
		started = true;
	}

	this.back = function (amount) {
		amount = (amount) ? amount : rewind;
		word -= amount;
		if (word < 0) {
			word = 0;
			block --;
			if (block < 0) block = 0;
		}
	}

	this.gotoBlock = function(blockNumber) {
		word = 0;
		block = blockNumber;
		this.start();
	}

	this.forward = function (amount) {
		amount = (amount) ? amount : rewind;
		word += amount;
	}
	//initializer thing
	var me = this; //so it can be used in the jQuery callback
	jQuery(document).ready(function () {
		console.log(me.display);
		reader = jQuery(me.display)[0]; 
		console.log(reader.innerText);
		
		//Copy each text block into the block array
		jQuery(me.selector).each(function (index, element){
			blocks.push(element.innerText);	
			reads.push(element);
		});
		
		//Split out the words.
		for (var i = 0; i < blocks.length; i ++){
			blocks[i] = blocks[i].split(' ');
		}
		
		timer = window.setTimeout(displayWord, initWait);	
	});
	
	var displayWord = function () {
		var curWord = blocks[block][word];
		/*Future feature: allow html tags in read text
		while (curWord.match(/(<([^>]+)>)/ig)) {
			word ++;
			curWord = blocks[block][word];
		}*/

		// if there are no more words in this block.
		var timeout;// = (curWord.length * 60000) / cpm;
		if (word >= blocks[block].length) {
			block ++;
			word = 0;
			timeout = blockWait;
			curWord = blocks[block][word];
		} else {
			timeout = (curWord.length * 60000) / cpm;
		}
		// if there are still blocks to read
		if (block < blocks.length) {
			
			//var timeout = (curWord.length * 60000) / cpm;
			if (curWord.match(/.*\./)) {
				timeout = periodWait;
			} else if (curWord.match(/.*[,;:]/)) {
				timeout = commaWait;
			}
			
			if (started) {
				timer = window.setTimeout(displayWord, timeout);
			}
		}
		
		reader.innerText = curWord;
		
		//make the currently read word red(hehe)
		if (showWord) {
			var out = "";
			for (var i = 0; i < word; i ++) {
				out = out + blocks[block][i] + " ";
			}
			out = out + '<span id="curword">' + curWord + ' </span>';
			for (var i = word + 1; i < blocks[block].length; i ++){
				out = out + blocks[block][i] + " ";
			}
			reads[block].innerHTML = out;
		}

		word ++;
	}
};

var reader = new strobeRead();
