//instantiating global variables
var unit = 0.3;
var detector;
var timer;
var clock = 0;
var open_clock = 0;
var chin_clock = 0;
var eyes_Closed = false;
var chin_Raised = false;
var close_start;
var close_end;
var open_start = 0;
var open_end;
var temp_Morse_symbol = "Temp Symbol: ";
var curr_Morse_message = "Morse Message: ";
var curr_English_message = "";
var english
var initialized = false;
var hi_passed = false;
var hello_world_passed = false;

onload = function() {

	var divRoot = document.getElementById("affdex_elements");
	var width = 450;
	var height = 450;
	var faceMode = affdex.FaceDetectorMode.LARGE_FACES;

	      //Construct a CameraDetector and specify the image width / height and face detector mode.
	      detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

	      //Turning on all expression detection parameter.
	      detector.detectAllExpressions();
	      detector.detectAllEmotions();
	      detector.detectAllEmojis();
	      detector.detectAllAppearance();

	      // Configure all call back functions. Each action contains two call backs one for success, one for faliure.
	      // detector initialization callbacks
	      detector.addEventListener("onInitializeSuccess", function() {});
	      detector.addEventListener("onInitializeFailure", function() {});

	      //webcam access callbacks
	      detector.addEventListener("onWebcamConnectSuccess", function() {
	      });
	      detector.addEventListener("onWebcamConnectFailure", function() {
	      });

	      /*When a frame is processed successfully, onImageResults is called. "faces" is a dictionary containing all
	      	the quantitative data of facial expressions, and, in this case, is the major parameter we care about. We
	      	parse the faces to find the eyeClosure metrics and generate the morse code.
	      	*/
	      	detector.addEventListener("onImageResultsSuccess", function (faces, image, timestamp) {
	      		if(!initialized) {
	      			tutorial();
	      			initialized = true;
	      		}
	      		if (!hi_passed) {
	      			hi_test();
	      		} else {
	      			start_typing();
	      		}
	      		for (var key in faces) {
	      			var value = faces[key];
	      			eyes_Metric = Math.round(value["expressions"]["eyeClosure"]);
	      			brow_Metric = Math.round(value["expressions"]["browRaise"]);
	      			chin_Metric = Math.round(value["expressions"]["chinRaise"]);
	      			document.getElementById("bR").innerHTML = "Brow Raise: " + brow_Metric;
	      			document.getElementById("eC").innerHTML = "Eyes Closed: " + eyes_Metric;
	      			document.getElementById("cR").innerHTML = "Chin Raise: " + chin_Metric;
	      			if (brow_Metric > 98) {
	      				curr_English_message = curr_English_message + " ";
	      				document.getElementById("English_Message").innerHTML = "Message: " + curr_English_message;
	      			}
	      			if (chin_Metric > 80 && !eyes_Closed && !chin_Raised) {
	      				chin_Raised = true;
	      				chin_clock = 0;
	      			} else if (chin_Metric < 90 && chin_Raised) {
	      				chin_Raised = false;
	      			}
	      			if (chin_clock > unit) {
	      				curr_English_message = curr_English_message.slice(0, -1);
	      				document.getElementById("English_Message").innerHTML = "Message: " + curr_English_message;
	      				chin_clock = 0;
	      			}
	      			if (eyes_Metric > 90 && !eyes_Closed) {
	      				eyes_Closed = true;
	      				close_start = clock;
	      				open_clock = 0;
	      			} else if (eyes_Metric < 90 && eyes_Closed) {
	      				eyes_Closed = false;
	      				close_end = clock;
	      				generateMorseSymbol(close_start, close_end);
	      			}
	      			if (open_clock > unit * 3) {
	      				generateLetter();
	      			}
	      		}
	      	});
	      	detector.addEventListener("onImageResultsFailure", function (image, timestamp, err_detail) {});

	      //onStop callbacks
	      detector.addEventListener("onStopSuccess", function() {
	      	document.getElementById("eC").innerHTML = "";
	      	curr_Morse_message = "Message: ";
	      });
	      detector.addEventListener("onStopFailure", function() {});
	  };

	  // Function starts the detector and eye tracking. trackClosure is called every 10 milliseconds.
	  function onStart() {
	  	document.getElementById("eC").innerHTML = "Loading...";
	  	document.getElementById("bR").innerHTML = "";
	  	document.getElementById("cR").innerHTML = "";
	  	document.getElementById("Morse_Message").innerHTML = temp_Morse_symbol;
	  	document.getElementById("English_Message").innerHTML = curr_English_message;
	  	detector.start();
	  	timer = setInterval(trackClosure, 10);
	  };

	  // Function stops the detector. Resets the timer.
	  function onStop() {
	  	detector.stop();
	  	clearInterval(timer);
	  };

	  // Function tracks the closure interval of the eye.
	  function trackClosure() {
	  	clock = clock + 0.01;
	  	if (!eyes_Closed) {
	  		open_clock = open_clock + 0.01;
	  	}
	  	if (chin_Raised) {
	  		chin_clock = chin_clock + 0.01;
	  	}
	  	// document.getElementById("Clock").innerHTML = "Time: " + clock.toFixed(2);
	  };

	  // Function tanslates blinks to morse code. If blink shorter than 0.3 its eqivalent to dot, else its a dash.
	  function generateMorseSymbol(c_start, c_end) {
	  	if (c_end - c_start <= unit) {
	  		curr_Morse_message = curr_Morse_message + ".";
	  		temp_Morse_symbol = temp_Morse_symbol + ".";
	  	} else {
	  		curr_Morse_message = curr_Morse_message + "-";
	  		temp_Morse_symbol = temp_Morse_symbol + "-";
	  	}
	  	document.getElementById("Morse_Message").innerHTML = "Temp Symbol: " + temp_Morse_symbol;
	  };

	  function generateLetter() {
	  	var curr_Letter = MorseToEnglishDict[temp_Morse_symbol];
	  	if (curr_Letter != undefined) {
	  		curr_English_message = curr_English_message + MorseToEnglishDict[temp_Morse_symbol];
	  	}
	  	document.getElementById("English_Message").innerHTML = "Message: " + curr_English_message;
	  	temp_Morse_symbol = "";
	  	document.getElementById("Morse_Message").innerHTML = "Temp Symbol: " + temp_Morse_symbol;
	  	open_clock = 0;
	  }

	  function tutorial() {
	  	var affdexDiv = document.getElementById("affdex_elements");
	  	affdexDiv.style.display = "none";
	  	var tutorial = document.getElementById("notepad");
	  	tutorial.style.display = "inline";
	  	// document.getElementById("tutorial").innerHTML = "Welcome to the Tutorial";
	  	document.getElementById("display").style.backgroundColor = "#ffff99";
	  }

	  	function hi_test() {
		  	document.getElementById("tutorial_instructions").innerHTML = "Please type 'HI'";
				// document.getElementById("tutorial_text").innerHTML = "HI";
			if (curr_English_message === "HI") {
				hi_passed = true;
			}
		}

		function start_typing() {
			var tutorial_instructions = document.getElementById("tutorial_instructions");
			tutorial_instructions.style.display = "none";
		}


	var MorseToEnglishDict = {
		".-" : "A",
		"-..." : "B",
		"-.-." : "C",
		"-.." : "D",
		"." : "E",
		"..-." : "F",
		"--." : "G",
		"...." : "H",
		".." : "I",
		".---" : "J",
		"-.-" : "K",
		".-.." : "L",
		"--" : "M",
		"-." : "N",
		"---" : "O",
		".--." : "P",
		"--.-" : "Q",
		".-." : "R",
		"..." : "S",
		"-" : "T",
		"..-" : "U",
		"...-" : "V",
		".--" : "W",
		"-..-" : "X",
		"-.--" : "Y",
		"--.." : "Z",
		".----" : "1",
		"..---" : "2",
		"...--" : "3",
		"....-" : "4",
		"....." : "5",
		"-...." : "6",
		"--..." : "7",
		"---.." : "8",
		"----." : "9",
		"-----" : "0"
	};
