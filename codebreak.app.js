/**********
 * 
 * 
 * 
 *****/

// create a protected namespace using an IIFE
(function(App) {

/****
 * Shuffle array elements randomly
 * Fisher-Yates (aka Knuth) Shuffle algorithm courtesy
 * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 **/
function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


App.data = {};

/****
 *
 **/
App.init = function() {

	App.data.codedisplayElem = $('#codedisplay');
	App.data.resultdisplayElem = $('#resultdisplay');
	App.data.resultsElem = $('#results');
	App.data.footerElem = $('[data-role=footer] h2');
	App.data.codeVal = [];
	App.data.totalDigits = 3;
	App.data.currentDigit = 0;
	App.data.turnCount = 0;
	App.data.enteredVal = [];

	$(document.body)
		.on('click', '.keypad', App.keypadHandler)
		.on('click', '#reset', function(e) {
			App.data.resultsElem.popup('close');
			App.resetGame();
		 });

	App.resetGame(); // reset game

}; // App.init

/****
 *
 **/
App.resetGame = function() {
	//console.log('Game reset');
	App.generateCode();
	App.resetEnteredVal();
	App.displayEnteredVal();
	App.data.resultdisplayElem.empty();
	App.data.footerElem.html('Tries: 0');
}; // App.resetGame

/****
 *
 **/
App.resetEnteredVal = function() {
	// resets the value of the entered code to dashes
	App.data.enteredVal = [];
	for (var c=0; c < App.data.totalDigits; c++) {
		App.data.enteredVal.push('-');
	}
// also reset place counter
	App.data.currentDigit = 0;

}; // App.resetEnteredVal

/****
 *
 **/
App.displayEnteredVal = function() {
	App.data.codedisplayElem.html(App.data.enteredVal.join(''));
}; // App.displayEnteredVal

/****
 *
 **/
App.generateCode = function() {
	var srcArray = ['0','1','2','3','4','5','6','7','8','9'];
	shuffle(srcArray); // scramble source array to help with randomization

	App.data.codeVal = []; // reset code array

	for (var c = 0; c < App.data.totalDigits; c++) {
		
		// get a random index number. If the generated index is greater 
		// than the current array length, retry
		var numbersLeft = srcArray.length;
		do {
			var i = Math.floor(Math.random() * 10);
		} while(i >= numbersLeft);

		// now extract the value from the src array and add it to the codeVal array
		App.data.codeVal.push(srcArray.splice(i, 1)[0]); // note that splice() returns an array. hence the [0]

		//console.log(App.data.codeVal,srcArray);
	}

}; // App.generateCode

/****
 *
 **/
App.keypadHandler = function(e) {
	// get what key on pad was pressed
	var key = $(this).val();

	// figure out what to do with each keypad button
	switch(key) {
		case 'CLR': 
			// clear display
			App.resetEnteredVal();
			App.displayEnteredVal();
			App.data.resultdisplayElem.empty();
		break;

		case 'ENT':
			// submit guess
			App.data.turnCount++; // increment turn counter
			App.data.footerElem.html('Tries: ' + App.data.turnCount);

			var result = App.checkValue();
			//console.log(result);

			if (result === true) { 
				var content = 
					'<h2>Code Broken!</h2>' +
					'<p>Congratulations! You broke the code in ' + 
					App.data.turnCount + (App.data.turnCount > 1 ? ' tries' : 'try') + '!</p>' +
					'<p><input type="button" id="reset" class="ui-shadow ui-corner-all" value="New Game" /></p>';

				App.data.resultsElem.html(content); // update popup content
				
				// the info on how to open the popups programmatically isn't in the 1.4.3 demo docs *smh*
				// Go here for more in-depth info instead:
				// http://demos.jquerymobile.com/1.2.0-rc.2/docs/pages/popup/
				// http://demos.jquerymobile.com/1.2.0-rc.2/docs/pages/popup/options.html
				App.data.resultsElem.popup({transition: 'pop'}); // initialize popup
				App.data.resultsElem.popup('open'); // display popup

			} else {
				var content = 
					'<span>' + result[0] + ' ' + result[1] + '</span>';

				App.data.resultdisplayElem.html(content);
			}
		break;

		default: // numbers
			// update enteredVal
			App.data.enteredVal[App.data.currentDigit++] = key;
			App.displayEnteredVal();

			// reset place counter if we exceed size
			if (App.data.currentDigit >= App.data.totalDigits) App.data.currentDigit = 0;
		break;
	} // switch
	
	//console.log(App.data.enteredVal);

}; // App.keypadHandler

/****
 * Checks the entered code against the generated code
 * Returns true if perfect match or an array [Bulls, Cows]
 **/
App.checkValue = function() {
	// easy test - join and compare strings
	if (App.data.enteredVal.join('') == App.data.codeVal.join('')) return true;

	// determine bulls and cows
	var bulls = 0, cows = 0;

	for (var c = 0; c < App.data.totalDigits; c++) {
		if (App.data.enteredVal[c] == App.data.codeVal[c]) {
			bulls++;
		} else {
			if (App.data.codeVal.indexOf(App.data.enteredVal[c]) != -1) cows++;
		}
	}

	return [bulls, cows];

}; // App.checkValue

})(window.App = window.App || {});


// initialize app on first load
// can't use document.ready on jqm page loads
$(document).ready(App.init);
