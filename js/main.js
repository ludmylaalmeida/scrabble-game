/*  Assignment 9: Implementing a Bit of Scrabble with Drag-and-Drop
    File: main.js
    Ludmyla Almeida, UMass Lowell Computer Science, ludmyla_almeida@student.uml.edu
    Copyright (c) 2019 by Ludmyla Almeida. All rights reserved.
*/

let WORDSCORE = 0;
let WORDLENGTH = 0;
let LETTERPLACEDONRACK = [];
let SCRABBLELETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_";

$(document).ready(function() {
  // create board
  createScrabbleBoard();
  createLetters();
  enableDragAndDrop();

  // Based on button click
  // reset game
  $("#resetScrabbleGame").click(function() {
    resetScrabbleGame();
    enableDragAndDrop();
  });

  // switch letters
  $("#switchLetters").click(function() {
    switchLetters();
    enableDragAndDrop();
  });

  // when put letters back on rack button is clicked, function responsible for returning letter to rack is called and function that handles drag and drop is called
  $("#putLetterBack").click(function() {
    putLetterBack();
    enableDragAndDrop();
  });

  // clear game board
  $("#clearScrabbleBoard").click(function() {
    clearScrabbleBoard();
    enableDragAndDrop();
  });

  // on submit
  $("#submit").click(function() {
    submitTheWord();
    enableDragAndDrop();
  });
});

// function that creates letters
function createLetters() {
  let letters = "";
  letters += '<table id="rackOfWord"><tr>';

  LETTERPLACEDONRACK = [];

  for (let x = 0; x < 7; x++) {
    let randomIndex;
    randomIndex = Math.floor(Math.random() * SCRABBLELETTERS.length);

    while (ScrabbleTiles[SCRABBLELETTERS[randomIndex]].number_remaining === 0) {
      // loops until the letter is left and if not left then gets new letter
      randomIndex = Math.floor(Math.random() * SCRABBLELETTERS.length);
    }

    let letterLink = "img/Letter_" + SCRABBLELETTERS[randomIndex] + ".png"; // access to letter location
    letters +=
      "<td><img id='tile_drag_" +
      x +
      "' class='board_piece_" +
      SCRABBLELETTERS[randomIndex] +
      "' src='" +
      letterLink +
      "' /></img></td>";

    ScrabbleTiles[SCRABBLELETTERS[randomIndex]].number_remaining =
      ScrabbleTiles[SCRABBLELETTERS[randomIndex]].number_remaining - 1; // updates the remaining number
    LETTERPLACEDONRACK.push({
      Letter: SCRABBLELETTERS[randomIndex],
      id: "tile_drag_" + x,
      position: x,
      value: ScrabbleTiles[SCRABBLELETTERS[randomIndex]].value,
      Link:
        "<img id='tile_drag_" +
        x +
        "' class='board_piece_" +
        SCRABBLELETTERS[randomIndex] +
        "' src='" +
        letterLink +
        "' /></img>"
    });
  }

  letters += "</tr></table>";
  $("#score").html(WORDSCORE); // this will show score
  $("#rackOfLetters").html(letters); // this will show letters on rack
  changeLeftWord(); // function that changes left word is called
}

// function responsible for doing drag
function drag(string) {
  for (let x = 0; x < 7; x++) {
    $("#tile_drag_" + x).draggable({
      //I used https://downing.io/GUI/js/scrabble/draggable.js as a reference to help me
      revert: "invalid",
      start: function(ev, ui) {
        // preserves the initial position
        startPos = ui.helper.position();
      },
      stop: function() {
        // if invalid event then draggable is returned to invalid option
        $(this).draggable("option", "revert", "invalid");
      }
    });
  }
}

function drop() {
  $("#boardGame td").droppable({
    accept: ".ui-draggable", // accepts ui-draggable as valid
    tolerance: "intersect", // drag overlaps drop
    revert: "invalid", // in order to make sure that you can drop
    drop: function(event, ui) {
      if ($(this).attr("id") != undefined) {
        // to check for already letter exists and if it does then returns back to rack
        ui.draggable.draggable("option", "revert", true);
        return;
      } else {
        $(this)[0].id = $(this)[0].id + " dropped";
        ui.draggable[0].style.cssText = "";

        let image;
        image = ui.draggable[0].outerHTML; // way to receive content that is dragged

        let stringID;
        stringID = String($(this)[0].id);

        let correct;
        correct = stringID.match(/(.+)(dropped)/);

        if (!isSpaceLetter(ui.draggable)) {
          // if not space letter then follow the steps to handle that scenario
          let otherTD;
          otherTD =
            '<td class="' +
            $(this)[0].className +
            '" id="' +
            correct[2] +
            '">' +
            image +
            "</td>";
          $(this)[0].outerHTML = otherTD;
        } else {
          // if space letter then follow the steps to handle that scenario
          let otherImage;
          otherImage = changeSpaceLetter(ui.draggable);
          let otherTD;
          otherTD =
            '<td class="' +
            $(this)[0].className +
            '" id="' +
            correct[2] +
            '">' +
            otherImage +
            "</td>";
          $(this)[0].outerHTML = otherTD;
        }

        ui.draggable[0].outerHTML = "";
        enableDragAndDrop();
        getRidOfIDAfterDrag();
      }
    },
    out: function(event, ui) {
      // when letter is dragged to a different location from table do nothing
    }
  });
}

function putLetterBack() {
  let temp;
  temp = $("#boardGame").find("td"); // finds all td

  temp.each(function() {
    // goes through each td
    if (String($(this)[0].id) === "dropped") {
      $(this).removeAttr("id");
      $(this)[0].firstChild.outerHTML = "";
    }
  });

  updateLetters();
}

function resetScrabbleGame() {
  let SCRABBLELETTERS;
  SCRABBLELETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_";

  for (let x = 0; x < SCRABBLELETTERS.length; x++) {
    ScrabbleTiles[SCRABBLELETTERS[x]].number_remaining =
      ScrabbleTiles[SCRABBLELETTERS[x]].original_distribution;
  }

  WORDSCORE = 0; 
  WORDLENGTH = 0; 
  createScrabbleBoard(); 
  createLetters(); 
  changeLeftWord(); 
  $(".invalid-feedback").html("");
}

function switchLetters() {
  let temp = $("#boardGame").find("td");
  temp.each(function() {
    if ($(this)[0].id == "dropped") {
      // if id is dropped then empty it and then call the function that removes the id
      $(this)[0].innerHTML = "";
      getRidOfIDAfterDrag();
    }
  });

  for (let x = 0; x < LETTERPLACEDONRACK.length; x++) {
    // goes through LETTERPLACEDONRACK's element
    let letter = LETTERPLACEDONRACK[x].Letter;
    ScrabbleTiles[letter].number_remaining += 1; // updates the remaining number
  }

  LETTERPLACEDONRACK = [];
  changeLeftWord(); 
  createLetters(); 
  enableDragAndDrop();
}

function getRidOfIDAfterDrag() {
  let temp = $("#boardGame").find("td"); // finds all td

  temp.each(function() {
    // goes through each td and removes id
    if ($(this)[0].childElementCount == 0 && $(this)[0].id != "") {
      $(this).removeAttr("id");
    }
  });
}

function enableDragAndDrop() {
  drag();
  drop();
}

function clearScrabbleBoard() {
  createScrabbleBoard(); // function that creates scrabble board game is called to create a new scrabble board game
  WORDLENGTH = 0; // changes WORDLENGTH's value to 0
}

function changeLeftWord() {
  let left = "";
  $("#tilesLeft").html(left);

  let numberOfLetterLeft = 0;

  for (let x = 0; x < SCRABBLELETTERS.length; x++) {
    // loops through to find the letters left
    numberOfLetterLeft += ScrabbleTiles[SCRABBLELETTERS[x]].number_remaining;
  }

  left += '<table class="leftword">';
  left +=
    '<tr><td class="RowWord Left" colspan="9">Letters Remaining: ' +
    numberOfLetterLeft +
    "</td></td>"; // shows letters left
  left +=
    '<tr><td class="RowWord">' +
    "A: " +
    ScrabbleTiles["A"].number_remaining +
    "</td>"; // shows A-to-I letters left
  left +=
    '<td class="RowWord">' +
    "B: " +
    ScrabbleTiles["B"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "C: " +
    ScrabbleTiles["C"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "D: " +
    ScrabbleTiles["D"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "E: " +
    ScrabbleTiles["E"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "F: " +
    ScrabbleTiles["F"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "G: " +
    ScrabbleTiles["G"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "H: " +
    ScrabbleTiles["H"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "I: " +
    ScrabbleTiles["I"].number_remaining +
    "</td></td>";
  left +=
    '<tr><td class="RowWord">' +
    "J: " +
    ScrabbleTiles["J"].number_remaining +
    "</td>"; // shows J-to-R letters left
  left +=
    '<td class="RowWord">' +
    "K: " +
    ScrabbleTiles["K"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "L: " +
    ScrabbleTiles["L"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "M: " +
    ScrabbleTiles["M"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "N: " +
    ScrabbleTiles["N"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "O: " +
    ScrabbleTiles["O"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "P: " +
    ScrabbleTiles["P"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "Q: " +
    ScrabbleTiles["Q"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "R: " +
    ScrabbleTiles["R"].number_remaining +
    "</td></td>";
  left +=
    '<tr><td class="RowWord">' +
    "S: " +
    ScrabbleTiles["S"].number_remaining +
    "</td>"; 
  left +=
    '<td class="RowWord">' +
    "T: " +
    ScrabbleTiles["T"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "U: " +
    ScrabbleTiles["U"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "V: " +
    ScrabbleTiles["V"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "W: " +
    ScrabbleTiles["W"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "X: " +
    ScrabbleTiles["X"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "Y: " +
    ScrabbleTiles["Y"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "Z: " +
    ScrabbleTiles["Z"].number_remaining +
    "</td>";
  left +=
    '<td class="RowWord">' +
    "_: " +
    ScrabbleTiles["_"].number_remaining +
    "</td></td>";
  left += "</table>";

  $("#tilesLeft").html(left);
}

// function that checks if there is space letter
function isSpaceLetter($Space) {
  let getID;
  getID = $Space[0].className;

  let PresentLetter;
  PresentLetter = getID.match(/(board_piece_)(.)(.+)/);

  if (PresentLetter[2] != "_") {
    // checks if space letter is not present and returns false
    return false;
  } else {
    // checks if space letter is present and returns true
    return true;
  }
}

function changeSpaceLetter($spaceLetter) {
  let letter;
  letter = prompt("Enter a letter from A-to-Z to replace the space [_] letter", "S"); 

  while (isAlphabet(letter) || String(letter).length > 1) {
    // loops until the value given by the user is a letter from A-to-Z or the input is not more than one character
    letter = prompt("Enter a letter from A-to-Z to replace the space [_] letter","S");
  }

  letter = letter.toUpperCase(); // changes the letter to upper case

  let text;
  text = $spaceLetter[0].outerHTML;

  let regularExpression;
  regularExpression = text.match(/(.+)(board_piece_)(.)(.+)(Letter_)(.)(.+)/);

  text =
    regularExpression[1] +
    regularExpression[2] +
    letter +
    regularExpression[4] +
    regularExpression[5] +
    letter +
    regularExpression[7]; 

  return text;
}

// function that checks if there is an alphabet
function isAlphabet(letter) {
  let temp;
  temp = String(letter);

  let resultingLetter;
  resultingLetter = temp.match(/([A-Za-z])+$/); // I used https://www.w3resource.com/javascript/form/all-letters-field.php to help me

  if (resultingLetter != null) {
    // if resulting letter is not equal to null then return false as it is not an alphabet
    return false;
  } else {
    // if resulting letter is equal to null then return true as it is an alphabet
    return true;
  }
}

// get letter
function getLetter($temp) {
  let imageID;
  imageID = $temp[0].firstChild.id;

  for (let x = 0; x < LETTERPLACEDONRACK.length; x++) {
    // goes through the letters on rack
    if (LETTERPLACEDONRACK[x].id == imageID) {
      // if letter is on rack then returns the letter on rack
      return LETTERPLACEDONRACK[x];
    }
  }
}

// functions that recevies new letter on rack
function receiveNewLetter() {
  let MissingLetters;
  MissingLetters = 7 - LETTERPLACEDONRACK.length;

  let temp;
  temp = [0, 0, 0, 0, 0, 0, 0];

  let y;
  y = 0;

  for (let x = 0; x < 7; x++) {
    if (y < LETTERPLACEDONRACK.length) {
      if (LETTERPLACEDONRACK[y].position == x) {
        temp[x] = LETTERPLACEDONRACK[y];
        y++;
      }
    }
  }

  for (let x = 0; x < temp.length; x++) {
    if (temp[x] == 0) {
      let randomIndex;
      randomIndex = Math.floor(Math.random() * SCRABBLELETTERS.length); // recevies random index from SCRABBLELETTERS and I used https://stackoverflow.com/questions/5915096/get-random-item-from-javascript-array to help me
      while (
        ScrabbleTiles[SCRABBLELETTERS[randomIndex]].number_remaining === 0
      ) {
        randomIndex = Math.floor(Math.random() * SCRABBLELETTERS.length);
      }

      ScrabbleTiles[SCRABBLELETTERS[randomIndex]].number_remaining =
        ScrabbleTiles[SCRABBLELETTERS[randomIndex]].number_remaining - 1; // changes the left value in ScrabbleTiles

      let letterLink;
      letterLink = "img/Letter_" + SCRABBLELETTERS[randomIndex] + ".png"; // access to letter location

      temp[x] = {
        Letter: SCRABBLELETTERS[randomIndex],
        id: "tile_drag_" + x,
        position: x,
        value: ScrabbleTiles[SCRABBLELETTERS[randomIndex]].value,
        Link:
          "<img id='tile_drag_" +
          x +
          "' class='board_piece_" +
          SCRABBLELETTERS[randomIndex] +
          "' src='" +
          letterLink +
          "' /></img>"
      };
    }
  }

  LETTERPLACEDONRACK = [];
  LETTERPLACEDONRACK = temp;
  updateLetters(); // function that updates letters is called
  changeLeftWord(); // function that updates the left word is called
}

// update Tiles
function updateLetters() {
  let letters;
  letters += '<table id="rackOfWord"><tr>';

  let y;
  y = 0;

  temp = $("#rackOfLetters").find("td"); // finds all td

  for (let x = 0; x < temp.length; x++) {
    // goes through each td
    if (x >= LETTERPLACEDONRACK.length) {
      // if not in present rack then empty it
      letters += "<td></td>";
    } else {
      // otherwise add to tiles
      letters += "<td>" + LETTERPLACEDONRACK[y].Link + "</td>";
      y++;
    }
  }

  letters += "</tr></table>";
  $("#rackOfLetters").html(letters); // this will update rack of letters
}

// function that revmoves letter from rack
function getRidOfLetterFromRack(x) {
  let temp;
  temp = [];

  for (let y = 0; y < LETTERPLACEDONRACK.length; y++) {
    // goes through LETTERPLACEDONRACK's element
    if (y != x) {
      temp.push(LETTERPLACEDONRACK[y]); // pushes to temp
    }
  }

  LETTERPLACEDONRACK = [];
  LETTERPLACEDONRACK = temp;
}

// function that places word on scrabble game board
function placeWordOnScrabbleBoard($word) {
  let temp;
  temp = $("#boardGame").find("td"); // finds all td

  temp.each(function() {
    // goes through each td
    if ($(this)[0].id == "dropped") {
      let tempID;
      tempID = $(this)[0].firstChild.className;

      let PresentLetter;
      PresentLetter = tempID.match(/(board_piece_)(.)(.+)/);

      let randomIndex;
      randomIndex = String($(this)[0].firstChild.id).replace("tile_drag_", ""); // receives random index for LETTERPLACEDONRACK

      getRidOfLetterFromRack(randomIndex); // removes letter on rack for that random index
      $(this)[0].firstChild.id = "letterImageIsValid"; // validates the letter
      $(this)[0].firstChild.className = PresentLetter[2];
      $(this)[0].id = "valid"; // makes id to valid
    }
  });
}

// function that receives word from the scrabble board
function receiveWordFromScrabbleBoard() {
  let Word;
  Word = [];

  let temp;
  temp = $("#boardGame").find("td"); // finds all td

  temp.each(function() {
    // goes through each td
    if (
      $(this)[0].childElementCount > 0 &&
      ($(this)[0].id == "dropped" || $(this)[0].id == "valid")
    ) {
      if ($(this)[0].id != "dropped") {
        let string;
        string = String($(this).attr("class"));

        let temp2;
        temp2 = string.match(/([a-zA-Z]+)(.+)(\d+)(.+)/);
        $temp = $(this);

        Word.push({
          // pushes the letter, value, position, bonus square multiplier, and score
          Letter: $(this)[0].firstChild.className,
          Value: ScrabbleTiles[$(this)[0].firstChild.className].value,
          position: temp2[3],
          times: temp2[1],
          score: 0
        });
      } else {
        let string;
        string = String($(this).attr("class"));

        let temp2;
        temp2 = string.match(/([a-zA-Z]+)(.+)(\d+)(.+)/);
        temp = $(this);

        let letter;
        letter = getLetter(temp);

        if (letter.Letter == "_") {
          // handles if there is a space letter
          let text;
          text = $(this)[0].firstChild.className;

          let regularExpression;
          regularExpression = text.match(/(board_piece_)(.)(.+)/);
          letter.Letter = regularExpression[2];
          letter.Value = ScrabbleTiles[regularExpression[2]].value;
        }

        Word.push({
          // pushes the letter, value, position, bonus square multiplier, and score
          Letter: letter.Letter,
          Value: letter.value,
          position: temp2[3],
          times: temp2[1],
          score: 0
        });
      }
    }
  });

  return Word;
}

// function that handles the scrabble game score
function receiveGameScore($word) {
  let gameScore;
  gameScore = 0;

  for (let x = 0; x < $word.length; x++) {
    if (String($word[x].times) === "threeTimesTheLetter") {
      // if three times the value of letter bonus square multiplier then multiply letter by 3
      $word[x].score = parseInt($word[x].Value) * 3;
    } else if (String($word[x].times) === "twoTimesTheLetter") {
      // if two times the value of letter bonus square multiplier then multiply letter by 2
      $word[x].score = parseInt($word[x].Value) * 2;
    } else {
      // otherwise do not multiply letter by anything
      $word[x].score = parseInt($word[x].Value);
    }

    gameScore += $word[x].score; // add up the total score
  }

  for (let x = 0; x < $word.length; x++) {
    if (String($word[x].times) === "tripleWord") {
      // if three times the value of word bonus square multiplier then multiply word by 3
      gameScore = parseInt(gameScore) * 3;
    } else if (String($word[x].times) === "twoTimesTheWord") {
      // if two times the value of word bonus square multiplier then multiply word by 2
      gameScore = parseInt(gameScore) * 2;
    } else {
      // otherwise do not multiply word by anything
      gameScore = parseInt(gameScore);
    }
  }

  return gameScore; // game score is returned
}

let scrabbleTable = "";
function createScrabbleBoard() {
  // function responsible for creating the beautiful scrabble board
  $("#boardGame").html(scrabbleTable);
  scrabbleTable += "<table>";

  let x = 1;

  while (x < 9) {
    // loop runs so that scrabble board row will be displayed according to the cases in createscrabbleBoardRow()
    createscrabbleBoardRow(x);
    x++;
  }

  x = 7;

  while (x > 0) {
    // loop runs so that scrabble board row will be displayed according to the cases in createscrabbleBoardRow()
    createscrabbleBoardRow(x);
    x--;
  }

  scrabbleTable += "</table>";
  $("#boardGame").html(scrabbleTable);
  scrabbleTable = "";

  let temp;
  temp = $("#boardGame").find("td");

  let length;
  length = temp.length;

  let row;
  row = 1;

  let column;
  column = 1;

  temp.each(function() {
    // for making the scrabble board tile
    let char;
    char = row.toString() + "-" + column.toString();
    $(this).addClass(char);

    if (column == 15) {
      row++;
      column = 0;
    }

    column++;
  });
}

function createscrabbleBoardRow(number) {
  // This function is responsible for creating the rows of the scrabble board with normal tiles and bonus square multiplier tiles
  switch (number) {
    case 1:
      scrabbleTable += '<tr><td class="tripleWord tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="twoTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tripleWord tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="twoTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tripleWord tile"></td>';
      break;

    case 2:
      scrabbleTable += '<tr><td class="tile"></td>';
      scrabbleTable += '<td class="doubleWord  tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="threeTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="threeTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="doubleWord tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      break;

    case 3:
      scrabbleTable += '<tr><td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="doubleWord tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="twoTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="twoTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="doubleWord tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      break;

    case 4:
      scrabbleTable += '<tr><td class="twoTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="doubleWord tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="twoTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="doubleWord tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="twoTimesTheLetter tile"></td>';
      break;

    case 5:
      scrabbleTable += '<tr><td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="doubleWord tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="doubleWord tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      break;

    case 6:
      scrabbleTable += '<tr><td class="tile"></td>';
      scrabbleTable += '<td class="threeTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="threeTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="threeTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="threeTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      break;

    case 7:
      scrabbleTable += '<tr><td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="twoTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="twoTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="twoTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="twoTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      break;

    case 8:
      scrabbleTable += '<tr><td class="tripleWord tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="twoTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="Star tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="twoTimesTheLetter tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tile"></td>';
      scrabbleTable += '<td class="tripleWord tile"></td>';
      break;
  }
}


function submitTheWord() {
  let Word = receiveWordFromScrabbleBoard(); // receives letters from scrabble game board

  if (WORDLENGTH == Word.length) {
    // prints error message if there is no letter or no already placed word is there on scrabble game board
    let error = "Please drag a letter!";
    $(".invalid-feedback").html(error);
  } else {
    // if there is letter or already placed word then execute the statements in the else condition
    let scrabbleGameScore;
    scrabbleGameScore = receiveGameScore(Word); // receives score from word

    placeWordOnScrabbleBoard(Word); // makes the word valid
    receiveNewLetter();
    WORDSCORE += scrabbleGameScore; // changes the score of the scrabble board game
    WORDLENGTH = Word.length;
    $("#score").html(WORDSCORE); // this is to print the score
    Word = [];
  }
}
