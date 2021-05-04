const grid = [[], [], [], [], [], [], [], [], [], []];
const mines = [];
const mineNumber = 20;
let uncovered = 0;
let flags = 0;
let ready = false;
let playing = true;
let message;

$(function() {
    message = $("#message");

    // creating tiles
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            const tile = document.createElement('div');
            tile.className = "tile";
            tile.id = i + "-" + j;
            tile.style.fontSize = "0";
            tile.textContent = '?';
            
            grid[i].push({
                type: 'empty',
                status: 'hidden',
                value: 0,
                x: j,
                y: i,
                html: tile
            });
            $("#board").append(tile);
            message.text('Mines Left: ' + mineNumber);
        }
    }
});

$(document).mousedown(function(event) {
    if (playing && event.target.className == 'tile') {
        const position = event.target.id.split('-');
        const tile = grid[parseInt(position[0])][parseInt(position[1])];

        switch (event.which) {
            case 1:
                leftMouse(tile);
                break;
            case 2:
                middleMouse(tile);
                break;
        }
    }
});

// called when a tile is left-clicked
const leftMouse = function(tile) {
    if (!ready) { // populate values
        tile.type = 'origin';
        // allowing for space around original clicked tile
        populatePerimeter(tile.x, tile.y);

        while (mines.length < mineNumber) { //make mines
            let possibleMine = grid[Math.floor(Math.random() * 10)][Math.floor(Math.random() * 10)];
            if (possibleMine.type == 'empty') {
                mines.push(possibleMine);
                possibleMine.type = 'mine';
            }
        }

        ready = true;
        for (let m of mines) { // increment necessary numbers around mines
            populatePerimeter(m.x, m.y);
        }
    }
    if (tile.type == 'mine' && tile.status == 'hidden') {
        lose(tile);
    } else {
        reveal(tile.x, tile.y);
    }
}

// called when a tile is middle-clicked (context menu is a pain to get rid of with right-clicks)
const middleMouse = function(tile) {
    if (!ready) {
        return;
    }

    switch (tile.status) {
        case 'revealed':
            return;
        case 'hidden':
            tile.html.style.backgroundImage = 'url(flag.png)';
            tile.status = 'flag';
            message.text('Mines Left: ' + (mineNumber - (++flags)));
            break;
        case 'flag':
            tile.html.style.backgroundImage = 'none';
            tile.html.style.fontSize = '5vh';
            tile.status = 'question';
            message.text('Mines Left: ' + (mineNumber - (--flags)));
            break;
        case 'question':
            tile.html.style.fontSize = '0';
            tile.status = 'hidden';
            break;
    }
}

// when first making mines, increments the values around it
const populatePerimeter = function(x, y) {
    if (x > 0 && y > 0) { // top-left
        initTile(x-1, y-1);
    }
    if (y > 0) { // top-mid
        initTile(x, y-1);
    }
    if (x < 9 && y > 0) { // top-right
        initTile(x+1, y-1);
    }
    if (x < 9) { // mid-right
        initTile(x+1, y);
    }
    if (x < 9 && y < 9) { // bottom-right
        initTile(x+1, y+1);
    }
    if (y < 9) { // bottom-mid
        initTile(x, y+1);
    }
    if (x > 0 && y < 9) { // bottom-left
        initTile(x-1, y+1);
    }
    if (x > 0) { // mid-left
        initTile(x-1, y);
    }
}

// used in populatePerimeter
const initTile = function(x, y) {
    const tile = grid[y][x];
    if (ready) {
        if (tile.type == "empty" || tile.type == "origin") {
            tile.type = "number";
        }
        if (tile.type == "number") {
            tile.value++;
        }
    } else {
        tile.type = "origin";
    }
}

// recursively reveals all tiles that should be revealed
const reveal = function(x, y) {
    if (x < 0 || x >= 10 || y < 0 || y >= 10) {
        return;
    }

    const tile = grid[y][x];

    if (tile.status != "hidden") {
        return;
    }

    tile.status = "revealed";
    tile.html.style.background = "rgb(85, 108, 241)";
    if (tile.type == 'number') {
        tile.html.textContent = tile.value;
        tile.html.style.fontSize = "5vh";
    } else {
        reveal(x+1, y+1);
        reveal(x, y+1);
        reveal(x-1, y+1);
        reveal(x-1, y);
        reveal(x-1, y-1);
        reveal(x, y-1);
        reveal(x+1, y-1);
        reveal(x+1, y);
    }

    if (++uncovered == 100 - mineNumber) {
        win();
    }
}

const win = function() {
    playing = false;
    for (let m of mines) {
        m.html.style.backgroundImage = 'url(flag.png)';
    }

    message.text('You win, nice!!');
}

const lose = function(mine) {
    playing = false;
    for (let m of mines) {
        m.html.style.backgroundImage = 'url(mine.png)';
    }
    mine.html.style.backgroundColor = 'red';
    message.text('You\'ll get it soon');
}

// called by the restart button or when the page loads
const reset = function() {
    for (let row of grid) {
        for (let t of row) {
            t.type = 'empty';
            t.status = 'hidden';
            t.value = 0;

            t.html.style.fontSize = '0';
            t.html.textContent = '?';
            t.html.style.background = 'rgb(160, 160, 160)';
            t.html.style.backgroundSize = 'contain';
        }
    }

    message.text('Mines Left: ' + mineNumber);
    mines.length = 0;

    uncovered = 0;
    flags = 0;
    ready = false;
    playing = true;
}