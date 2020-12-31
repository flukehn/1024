function Grid(size, previousState) {
  this.size = size;
  this.cells = previousState ? this.fromState(previousState) : this.empty();
}

// Build a grid of the specified size
Grid.prototype.empty = function () {
  var cells = [];

  for (var x = 0; x < this.size; x++) {
    var row = cells[x] = [];

    for (var y = 0; y < this.size; y++) {
      row.push(null);
    }
  }

  return cells;
};

Grid.prototype.fromState = function (state) {
  var cells = [];

  for (var x = 0; x < this.size; x++) {
    var row = cells[x] = [];

    for (var y = 0; y < this.size; y++) {
      var tile = state[x][y];
      row.push(tile ? new Tile(tile.position, tile.value) : null);
    }
  }

  return cells;
};

// Find the first available random position
Grid.prototype.randomAvailableCell = function () {
  
  var wf = [], rb = [] ,rp = [];
  for(var i = 0; i < 4; i++){
    wf[i] = [];
    rp[i] = [];
    for(var j = 0; j < 4; j++){
      wf[i][j] = 0;
    }
  }
  var mx = 0;
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      var p = this.cells[i][j];
      if (!p) {
        rp[i][j] = -1;
      } else {
        rp[i][j] = p.value;
        if (rp[i][j] > mx) {
          mx = rp[i][j];
        }
      }
    }
  }
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if (rp[i][j] == -1) continue;
      for (var x = 0; x < 4; x++) {
        for (var y = 0; y < 4; y++) {
          var q = 0;
          if (x > i) q += x - i;
          else q += i - x;
          if (y > j) q += y - j;
          else q += j - y;
          //var o = rp[i][j] >= mx/8 ? rp[i][j] : -rp[i][j];
          var o = rp[i][j], u = o;
          for ( ; mx > u; ) {
            u *= 2;
            o = -o;
          }
          //for (var t = 0; t < q; t++) o /= 1.3;
          wf[x][y] += o * Math.pow(1.0 / 1.5, q);
        }
      }
    }
  }
  var an = -1000000000;
  var am;
  if (Math.random() < 0.5) {
    for (var i = 0; i < 4; i++){
      for (var j = 0; j < 4; j++){
        if (rp[i][j] == -1 && ( wf[i][j] > an || (wf[i][j] == an && Math.random() < 0.5) ) ){
          an = wf[i][j];
          am = {x : i, y : j};
        }
      }
    }
  } else {
    for (var i = 3; i >= 0 ; i--) {
      for (var j = 3; j >= 0; j--) {
        if (rp[i][j] == -1 && (wf[i][j] > an || (wf[i][j] == an && Math.random() < 0.5))) {
          an = wf[i][j];
          am = {x: i, y: j};
        }
      }
    }
  }
  if (an >= -100000) return am;
  /*var cells = this.availableCells();
  if (cells.length) {
    return cells[0];
    //return cells[Math.floor(Math.random() * cells.length)];
  }*/
};

Grid.prototype.availableCells = function () {
  var cells = [];

  this.eachCell(function (x, y, tile) {
    if (!tile) {
      cells.push({ x: x, y: y });
    }
  });

  return cells;
};

// Call callback for every cell
Grid.prototype.eachCell = function (callback) {
  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      callback(x, y, this.cells[x][y]);
    }
  }
};

// Check if there are any cells available
Grid.prototype.cellsAvailable = function () {
  return !!this.availableCells().length;
};

// Check if the specified cell is taken
Grid.prototype.cellAvailable = function (cell) {
  return !this.cellOccupied(cell);
};

Grid.prototype.cellOccupied = function (cell) {
  return !!this.cellContent(cell);
};

Grid.prototype.cellContent = function (cell) {
  if (this.withinBounds(cell)) {
    return this.cells[cell.x][cell.y];
  } else {
    return null;
  }
};

// Inserts a tile at its position
Grid.prototype.insertTile = function (tile) {
  this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.removeTile = function (tile) {
  this.cells[tile.x][tile.y] = null;
};

Grid.prototype.withinBounds = function (position) {
  return position.x >= 0 && position.x < this.size &&
         position.y >= 0 && position.y < this.size;
};

Grid.prototype.serialize = function () {
  var cellState = [];

  for (var x = 0; x < this.size; x++) {
    var row = cellState[x] = [];

    for (var y = 0; y < this.size; y++) {
      row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
    }
  }

  return {
    size: this.size,
    cells: cellState
  };
};
