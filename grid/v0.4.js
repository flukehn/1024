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

	var wf = [], rb = [], rp = [], mt2 = [], havevisited = [], rmt2 = [], mntomx = [];
	for (var i = 0; i < 4; i++) {
		wf[i] = [];
		rp[i] = [];
		rmt2[i] = [];
		mntomx[i] = [];
		for (var j = 0; j < 4; j++) {
			wf[i][j] = 0;
			rmt2[i][j] = 1000000000;
			mntomx[i][j] = 1000000000
		}
	}
	for (var i = 0; i < 4; i++) {
		mt2[i] = [];
		havevisited[i] = [];
		for (var j = 0; j < 4; j++) {
			mt2[i][j] = [];
			havevisited[i][j] = [];
			for (var k = 0; k < 4; k++) {
				mt2[i][j][k] = 1000000000;
				havevisited[i][j][k] = 0;
			}
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
	var tot = 0;
	var nbcells = [], qcells = [];

	var h = 0, t = 0;
	var mxque = [];
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			if (rp[i][j] == -1) {
				continue;
			}

			if (rp[i][j] == mx) {
				mntomx[i][j] = 0;
				t++;
				mxque.push({x: i, y: j});
			}
			for (var x = 0; x < 4; x++) {
				for (var y = 0; y < 4; y++) {
					var q = 0;
					if (x > i) q += x - i;
					else q += i - x;
					if (y > j) q += y - j;
					else q += j - y;
					//var o = rp[i][j] >= mx/8 ? rp[i][j] : -rp[i][j];
					var o = rp[i][j], u = o;
					if (o < mx / 8) o = 0;
					for (; mx > u;) {
						u *= 2;
						o = -o;
					}

					for (var k = 0; k < q; k++) o /= 1.3;
					wf[x][y] += o;
				}
			}
		}
	}

	for (; h < t;) {
		var ap = mxque[h];
		h++;
		var x = ap.x, y = ap.y;
		var gx = [0, 0, 1, -1], gy = [1, -1, 0, 0];
		for (var i = 0; i < 4; i++) {
			var nx = x + gx[i];
			var ny = y + gy[i];
			if (nx < 0 || nx > 3 || ny < 0 || ny > 3) continue;
			if (mntomx[nx][ny] > mntomx[x][y] + 1) {
				mntomx[nx][ny] = mntomx[x][y] + 1;
				mxque.push({x: nx, y: ny});
				t++;
			}
		}
	}
	if (Math.random() < 0.7) {
		for (var i = 0; i < 4; ++i) for (var j = 0; j < 4; ++j)
			if (!(i == 0 || i == 3) || !(j == 0 || j == 3)) {
				mntomx[i][j] = 100;
			}
		for (var i = 0; i < 4; ++i) for (var j = 0; j < 4; ++j)
			wf[i][j] += 10000000 - 100000 * mntomx[i][j];
	}
	var prepush = 66;
	for (var i = 0; i < prepush; i++) qcells.push({x: 0, y: 0, i: 0});
	h = t = prepush;
	for (var i = 0; i < 4; i++)
		for (var j = 0; j < 4; j++)
			if (rp[i][j] == 2) {
				for (var d = 0; d < 4; d++) {
					mt2[i][j][d] = 0;
					t++;
					qcells.push({x: i, y: j, i: d});
				}
			}
	var mxmt2 = 0;
	for (; h < t;) {
		var ap = qcells[h];
		h++;
		var x = ap.x, y = ap.y, d = ap.i;
		if (havevisited[x][y][d]) continue;
		havevisited[x][y][d] = 1;
		mxmt2 = mt2[x][y][d];
		if (rmt2[x][y] > mxmt2) {
			rmt2[x][y] = mxmt2;
		}
		var gx = [0, 0, 1, -1], gy = [1, -1, 0, 0];
		for (var i = 0; i < 4; i++) {
			if (i != d) {
				var newmt2 = mxmt2 + 1;
				if (mt2[x][y][i] > newmt2) {
					mt2[x][y][i] = newmt2;
					t++;
					qcells.push({x: x, y: y, i: i});
				}
			}
			var nx = x + gx[i];
			var ny = y + gy[i];
			if (nx < 0 || nx > 3 || ny < 0 || ny > 3) continue;
			if (rp[nx][ny] != -1) continue;
			if (i == d) {
				var newmt2 = mxmt2;
				if (mt2[nx][ny][i] > newmt2) {
					mt2[nx][ny][i] = newmt2;
					h--;
					qcells[h] = {x: nx, y: ny, i: i};
				}
			} else {
				var newmt2 = mxmt2 + 1;
				if (mt2[nx][ny][i] > newmt2) {
					mt2[nx][ny][i] = newmt2;
					t++;
					qcells.push({x: nx, y: ny, i: i});
				}
			}
		}
	}
	mxmt2 = 0;
	for (var i = 0; i < 4; ++i)
		for (var j = 0; j < 4; ++j)
			if (rp[i][j] == -1 && rmt2[i][j] > mxmt2) mxmt2 = rmt2[i][j];
	if (mxmt2 > 0) {
		var mxnbcells = -1000000000;
		for (var i = 0; i < 4; ++i)
			for (var j = 0; j < 4; ++j) if (rp[i][j] == -1 && rmt2[i][j] > 0 && wf[i][j] > mxnbcells) {
				mxnbcells = wf[i][j];
				//nbcells.push({x: i, y: j});
			}
		for (var i = 0; i < 4; ++i)
			for (var j = 0; j < 4; ++j) if (rp[i][j] == -1 && rmt2[i][j] > 0 && wf[i][j] == mxnbcells) {
				nbcells.push({x: i, y: j});
			}
		//if (nbcells.length)
		return nbcells[Math.floor(Math.random() * nbcells.length)];
	}
	//if (t < prepush + 2) return;
	var an = -1000000000;
	var am;
	if (Math.random() < 0.5) {
		for (var i = 0; i < 4; i++) {
			for (var j = 0; j < 4; j++) {
				if (rp[i][j] == -1 && (wf[i][j] > an || (wf[i][j] == an && Math.random() < 0.5))) {
					an = wf[i][j];
					am = {x: i, y: j};
				}
			}
		}
	} else {
		for (var i = 3; i >= 0; i--) {
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
			cells.push({x: x, y: y});
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
