/*
    Name: Truong-Thinh Huynh SID: 01981340
    GitHub Username: TruongHuynh01981340
*/

// ScrabbleTiles from pieces.json
var ScrabbleTiles = [] ;
ScrabbleTiles["A"] = { "value" : 1,  "original-distribution" : 9,  "number-remaining" : 9  } ;
ScrabbleTiles["B"] = { "value" : 3,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["C"] = { "value" : 3,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["D"] = { "value" : 2,  "original-distribution" : 4,  "number-remaining" : 4  } ;
ScrabbleTiles["E"] = { "value" : 1,  "original-distribution" : 12, "number-remaining" : 12 } ;
ScrabbleTiles["F"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["G"] = { "value" : 2,  "original-distribution" : 3,  "number-remaining" : 3  } ;
ScrabbleTiles["H"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["I"] = { "value" : 1,  "original-distribution" : 9,  "number-remaining" : 9  } ;
ScrabbleTiles["J"] = { "value" : 8,  "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["K"] = { "value" : 5,  "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["L"] = { "value" : 1,  "original-distribution" : 4,  "number-remaining" : 4  } ;
ScrabbleTiles["M"] = { "value" : 3,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["N"] = { "value" : 1,  "original-distribution" : 6,  "number-remaining" : 6  } ;
ScrabbleTiles["O"] = { "value" : 1,  "original-distribution" : 8,  "number-remaining" : 8  } ;
ScrabbleTiles["P"] = { "value" : 3,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["Q"] = { "value" : 10, "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["R"] = { "value" : 1,  "original-distribution" : 6,  "number-remaining" : 6  } ;
ScrabbleTiles["S"] = { "value" : 1,  "original-distribution" : 4,  "number-remaining" : 4  } ;
ScrabbleTiles["T"] = { "value" : 1,  "original-distribution" : 6,  "number-remaining" : 6  } ;
ScrabbleTiles["U"] = { "value" : 1,  "original-distribution" : 4,  "number-remaining" : 4  } ;
ScrabbleTiles["V"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["W"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["X"] = { "value" : 8,  "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["Y"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["Z"] = { "value" : 10, "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["Blank"] = { "value" : 0,  "original-distribution" : 2,  "number-remaining" : 2  } ;

// An array with 15 indexes representing each letter that could make a word in the scrabble board.
// This will be use to print out the current word.
const wordArray = Array(15).fill("");
// An array with 15 indexes representing each tile in the scrabble board.
// 0 = not occupied by any draggable tile 1 = occupied by a draggable tile.
const tilesArray = Array(15).fill(0);
// An array with 7 indexes representing each tile in the tile holder.
// 1 = occupied by draggables 0 = not occupied, meaning the draggable is currently on the game board.
const rackArray = Array(7).fill(1);
// An important array that tracks each draggable and what their letter are currently are.
// This will be use for next button as we need to know which tile is already played vs thsoe that isn't played yet.
let draggableTileArray = [];

$(document).ready(function() {
    // Restart the game when the start button is clicked.
    $("#restartButton").click(function() {
        restartGame();
    })

    // Next the game when the start button is clicked.
    $("#nextButton").click(function() {
        nextGame();
    })

    // DraggableTile can only snap to droppableTile on the game board and tileHolder on the tile holder.
    $(".draggableTile").draggable({
        snap: ".droppableTile, .tileHolder",
        snapMode: "inner",
        revert: "invalid",
    });

    // https://api.jqueryui.com/draggable/#option-revert
    // https://api.jqueryui.com/droppable/#event-drop
    $(".droppableTile").droppable({
        // droppableTile will only take in draggableTile class
        accept: ".draggableTile",
        tolerance: "intersect",
        // Only runs if the draggable is dropped.
        drop: function(event, ui) {
            const sDraggableTile = $(ui.draggable);
            const sDroppableTile = $(this);
            
            // SUPER IMPORTANT to get the draggable tile to snap perfectly in the middle of the droppable.
            // https://stackoverflow.com/questions/744554/jquery-ui-dialog-positioning
            sDraggableTile.position({
                my: "center",
                at: "center",
                of: sDroppableTile,
            })

            let sDraggableTileLetter;
            
            // A regex that determine which letter from the img it is.
            // https://www.w3schools.com/js/js_regexp.asp
            const match = sDraggableTile.attr("src").match(/Scrabble_Tile_([A-Z_])\.jpg/);

            // If it doesn't return null, meaning any letter besides Blank will be retrieve.
            if (match) {
                sDraggableTileLetter = match[1];
            } else {
                // If it returned null, we assume it's Blank since my regex only checks for letter.
                // This will get filter out when updating the word.
                sDraggableTileLetter = "Blank";
            }

            // Get how much the letter is worth in points
            const sDraggableTileValue = ScrabbleTiles[sDraggableTileLetter]["value"];

            // Important for determining which draggable tile will need to be replaced when clicking on Next.
            for (let draggableTileId in draggableTileArray) {
                if (draggableTileId == sDraggableTile.attr("id")) {
                    draggableTileArray[draggableTileId] = null;
                }
            }

            // Get Tile based on index in index.html
            const sDroppableTileIndex = $(".droppableTile").index(sDroppableTile);
            sDraggableTile.data("droppableTileIndex", sDroppableTileIndex);

            // tile on game board is occupied, so the piece will revert
            if (tilesArray[sDroppableTileIndex] == 1) {
                // https://stackoverflow.com/questions/9960306/how-to-set-jquery-ui-draggable-revert-to-true-if-after-a-validation-i-decide-to
                sDraggableTile.draggable("option", "revert", true);

                return;
            }
            
            // If tile placed on game board isn't adjacent to the already placed pieces, then revert.
            if (!checkAdjacency(sDroppableTileIndex)) {
                sDraggableTile.draggable("option", "revert", true);
                
                return;
            }

            // Set revert to false since it passes all checks.
            sDraggableTile.draggable("option", "revert", false);

            // Update the word that will be printed out.
            updateWord(sDraggableTileLetter, sDroppableTileIndex);
            // Update tilesArray to 1, meaning it's now occupied.
            tilesArray[sDroppableTileIndex] = 1;
            // Update the score that will be printed out.
            updateScore(sDraggableTileValue, sDroppableTileIndex);
        },
        // Only runs if the piece is being dragged out
        // No longer useful since it was causing problem with updating the score.
        out: function(event, ui) {
            const sDraggableTile = $(ui.draggable);
            const sDroppableTile = $(this);

            let sDraggableTileLetter;
            
            const match = sDraggableTile.attr("src").match(/Scrabble_Tile_([A-Z_])\.jpg/);

            if (match) {
                sDraggableTileLetter = match[1];
            } else {
                sDraggableTileLetter = "Blank";
            }

            const sDraggableTileValue = ScrabbleTiles[sDraggableTileLetter]["value"];
            const sDroppableTileIndex = $(".droppableTile").index(sDroppableTile);
        }
    })

    // This is important for when you want to drag the tile from the game board back to the rack.
    $(".tileHolder").droppable({
        accept: ".draggableTile",
        tolerance: "intersect",
        drop: function(event, ui) {
            const sDraggableTile = $(ui.draggable);

            // Snap the draggable perfectly in the middle of droppable.
            sDraggableTile.position({
                my: "center",
                at: "center",
                of: $(this),
            })

            let sDraggableTileLetter;
            
            const match = sDraggableTile.attr("src").match(/Scrabble_Tile_([A-Z_])\.jpg/);

            if (match) {
                sDraggableTileLetter = match[1];
            } else {
                sDraggableTileLetter = "Blank";
            }

            const sDraggableTileValue = ScrabbleTiles[sDraggableTileLetter]["value"];

            // Since we dragged the draggabletile back, we have to substract the score since the tile
            // is no longer from the game board.
            updateScore(-sDraggableTileValue, sDraggableTile.data("droppableTileIndex"));
            // We also have to change the letter to "", which will get filter out soon.
            updateWord("", sDraggableTile.data("droppableTileIndex"));
            // Update the tilesArray to 0 since it's no longer occupied.
            tilesArray[sDraggableTile.data("droppableTileIndex")] = 0;

            sDraggableTile.draggable({
                snap: ".droppableTile, .tileHolder",
                snapMode: "inner",
                revert: "invalid",
            });
        }
    })

    // Randomze all tiles when game starts.
    randomGenerateTile();
})

var draggableTiles = document.getElementsByClassName("draggable");

function randomGenerateTile() {
    const draggableTiles = $(".draggableTile");
    const scrabbleTilesKeys = Object.keys(ScrabbleTiles);

    draggableTileArray = [];

    draggableTiles.each(function(index) {
        let randomScrabbleTile;

        do {
            // https://stackoverflow.com/questions/43267033/understanding-the-use-of-math-floor-when-randomly-accessing-an-array
            const randomIndex = Math.floor(Math.random() * scrabbleTilesKeys.length);
            randomScrabbleTile = scrabbleTilesKeys[randomIndex];
            // While loop condition will continue to run until there's a piece that still have some remaning.
        } while (ScrabbleTiles[randomScrabbleTile]["number-remaining"] <= 0);

        // Decrement the letter number remaining since we used one.
        ScrabbleTiles[randomScrabbleTile]["number-remaining"]--;

        const selectedTile = `./Scrabble_Tiles/Scrabble_Tile_${randomScrabbleTile}.jpg`;
        // Update img of the tile.
        $(this).attr("src", selectedTile);
        // Set draggableTileArray with a letter so it can keep track.
        draggableTileArray[$(this).attr("id")] = randomScrabbleTile;
    });

    $(".draggableTile").draggable({
        snap: ".droppableTile, .tileHolder",
        snapMode: "inner",
        revert: "invalid",
    });
}

function updateWord(letter, index) {
    wordArray[index] = letter;

    // Since I'm using a wordArray that have been intialized with "", we have to get rid of it
    // and also blank as well. This is because those were placeholder and blank is a word around for blank letter
    // not being recognized by my regex. 
    const currentWord = wordArray.filter(char => char != "" && char != "Blank").join("");

    // Update word
    $("#word").text(`Word: ${currentWord.trim()}`);
}

let totalScore = 0;
function updateScore(score, index) {
    // Update score if tilesArray is occupied and the tile is currently in Double Letter Score.
    if (tilesArray[index] == 1 && (index == 6 || index == 8)) {
        totalScore += score * 2;

        // Update score
        $("#totalScore").text(`Score: ${totalScore}`);

        return;
    // Otherwise, just update the score normally.
    } else {
        totalScore += score;
    }

    // There's a bug with negative score if you placed the tile back to the rack,
    // so I have to check if the total is less than 0 and reset to 0 if so.
    if (totalScore < 0) {
        totalScore = 0;
    }

    $("#totalScore").text(`Score: ${totalScore}`);
}

function checkAdjacency(currentIndex) {
    // If the titlesArray has no 1, this means it's the first tile, so location doesn't matter.
    if (!tilesArray.includes(1)) {
        return true;
    }

    // If currentIndex is greater than 0, meaning it's not the fartest left, then get tile to the left,
    // otherwise, it's 0 since the current tile is the fartest left.
    const leftIndex = currentIndex > 0 ? tilesArray[currentIndex - 1] : 0;
    // If currentIndex is less than legnth - 1, meaning it's not the fartest right, then get tile to the right,
    // otherwise, it's 0 since the current tile is the fartest right.
    const rightIndex = currentIndex < tilesArray.length - 1 ? tilesArray[currentIndex + 1] : 0;

    return leftIndex == 1 || rightIndex == 1;
}

function restartGame() {
    // Reset Word
    wordArray.fill("");
    $("#word").text("Word: ");

    // Reset Score
    totalScore = 0;
    $("#totalScore").text("Score: 0");

    // Reset Array with none being occupied
    tilesArray.fill(0);

    // Reset the number-remaining to original distribution
    for (let tile in ScrabbleTiles) {
        ScrabbleTiles[tile]["number-remaining"] = ScrabbleTiles[tile]["original-distribution"];
    }

    // Workaround by deleting all draggable and creating them again dynamically.
    $(".draggableTileContainer").empty();

    const tileHolderContainer = $(".tileHolderContainer");
    const draggableTileContainer = $(".draggableTileContainer");

    // Dynamically creating draggable since the position of draggable is changed if
    // the user dragged it around. So regenerating them will reset their position.
    for (let i = 0; i < 7; i++) {
        let tileLetter;

        do {
            const randomIndex = Math.floor(Math.random() * Object.keys(ScrabbleTiles).length);
            tileLetter = Object.keys(ScrabbleTiles)[randomIndex];
        } while (ScrabbleTiles[tileLetter]["number-remaining"] <= 0);
        
        ScrabbleTiles[tileLetter]["number-remaining"]--;

        const tileSrc = `./Scrabble_Tiles/Scrabble_Tile_${tileLetter}.jpg`;
        draggableTileContainer.append(`<img id="scrabbleTile${i + 1}" class="draggableTile" src="${tileSrc}">`);

        draggableTileArray[`scrabbleTile${i + 1}`] = tileLetter;
    }

    $(".draggableTile").draggable({
        snap: ".droppableTile, .tileHolder",
        snapMode: "inner",
        revert: "invalid",
    });
}

function nextGame() {
    // Reset word since previous word is calculated into score.
    wordArray.fill("");
    $("#word").text("Word: ");

    // Reset Array with none being occupied.
    tilesArray.fill(0);

    // Workaround by deleting all draggable and creating them again dynamically.
    $(".draggableTileContainer").empty();

    const draggableTileContainer = $(".draggableTileContainer");

    for (let draggableTileId in draggableTileArray) {
        // If it's null, this means that it's calculated in the score, and must be reset to get a new letter.
        if (draggableTileArray[draggableTileId] == null) {
            let tileLetter;

            do {
                const randomIndex = Math.floor(Math.random() * Object.keys(ScrabbleTiles).length);
                tileLetter = Object.keys(ScrabbleTiles)[randomIndex];
            } while (ScrabbleTiles[tileLetter]["number-remaining"] <= 0);
            
            ScrabbleTiles[tileLetter]["number-remaining"]--;

            const tileSrc = `./Scrabble_Tiles/Scrabble_Tile_${tileLetter}.jpg`;
            draggableTileContainer.append(`<img id="${draggableTileId}" class="draggableTile" src="${tileSrc}">`);
            
            draggableTileArray[draggableTileId] = tileLetter;
            // Otherwise, making sure the non touch tile is kept the same.
        } else {
            const tileSrc = `./Scrabble_Tiles/Scrabble_Tile_${draggableTileArray[draggableTileId]}.jpg`;
            draggableTileContainer.append(`<img id="${draggableTileId}" class="draggableTile" src="${tileSrc}">`);
        }
    }

    $(".draggableTile").draggable({
        snap: ".droppableTile, .tileHolder",
        snapMode: "inner",
        revert: "invalid",
    });
}