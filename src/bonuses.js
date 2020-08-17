function BonusesLayout(sLayout) {
  var self = this;
  self.boardm = [];
  self.init = function(bx, by) {
    self.bx = bx;
    self.by = by;

    for (var i = 0; i < bx; ++i) {
      self.boardm[i] = [];
      for (var j = 0; j < by; ++j) {
        self.boardm[i][j] = 0;
      }
    }

    var midx = Math.floor(bx / 2);
    var midy = Math.floor(by / 2);

    switch (sLayout) {
      case 'Classic':
        // DL
        self.q(3, 0, 1);
        self.q(6, 2, 1);
        self.q(0, 3, 1);
        self.q(midx, 3, 1);
        self.q(2, 6, 1);
        self.q(6, 6, 1);
        self.q(3, midy, 1);
        // TL
        self.q(5, 1, 2);
        self.q(1, 5, 2);
        self.q(5, 5, 2);
        // DW
        for (var i = 1; i < 5; ++i) {
          self.q(i, i, 3);
        }
        // TW
        self.q(0, 0, 4);
        self.q(midx, 0, 4);
        self.q(0, midy, 4);
        break;
      case 'WWF':
        // DL
        for (var i = 2, j = 1; i < 7; i += 2) {
          self.q(i, j, 1);
          self.q(j, i, 1);
          j *= 2;
        }
        // TL
        self.q(6, 0, 2);
        self.q(3, 3, 2);
        self.q(5, 5, 2);
        self.q(0, 6, 2);
        // DW
        self.q(5, 1, 3);
        self.q(midx, 3, 3);
        self.q(1, 5, 3);
        self.q(3, midy, 3);
        // TW
        self.q(3, 0, 4);
        self.q(0, 3, 4);
        break;
      case 'Basketball':
        // DL
        self.q(6, 0, 1);
        self.q(3, 1, 1);
        self.q(1, 3, 1);
        self.q(0, 6, 1);
        for (var i = 0; i < midx; ++i) {
          self.q(i, midy, 1);
          self.q(midx, i, 1);
        }
        // TL
        self.q(4, 1, 2);
        self.q(2, 2, 2);
        self.q(1, 4, 2);
        // DW
        self.q(midx, 0, 3);
        self.q(3, 3, 3);
        self.q(4, 4, 3);
        self.q(4, 5, 3);
        self.q(5, 6, 3);
        self.q(0, midy, 3);
        // TW
        self.q(5, 0, 4);
        self.q(0, 5, 4);
        break;
      case 'Mario Star':
        // DL
        self.m(midx, 0, 1);
        self.m(5, 3, 1);
        self.m(1, 4, 1);
        self.m(3, 4, 1);
        self.m(1, 6, 1);
        self.m(6, 6, 1);
        self.m(6, midy, 1);
        self.m(3, 8, 1);
        self.m(2, 10, 1);
        self.m(1, 12, 1);
        self.m(2, 14, 1);
        self.m(midx, 11, 1);
        // TL
        self.m(6, 1, 2);
        self.m(4, 4, 2);
        self.m(6, 5, 2);
        self.m(6, 11, 2);
        self.m(4, 13, 2);
        self.m(1, 14, 2);
        // DW
        self.m(5, 2, 3);
        self.m(2, 4, 3);
        self.m(0, 5, 3);
        self.m(2, 7, 3);
        self.m(3, 9, 3);
        self.m(2, 11, 3);
        self.m(2, 11, 3);
        self.m(5, 12, 3);
        self.m(1, 13, 3);
        self.m(3, 14, 3);
        // TW
        self.m(0, 4, 4);
        self.m(5, midy, 4);
        self.m(5, 8, 4);
        self.m(6, 8, 4);
        break;
      case 'Poké Ball':
        // DL
        self.q(6, 0, 1);
        self.q(3, 1, 1);
        self.q(1, 3, 1);
        self.q(midx, 5, 1);
        for (var i = 0; i < 6; ++i) {
          self.q(i, midy, 1);
        }
        // TL
        self.q(4, 1, 2);
        self.q(2, 2, 2);
        self.q(1, 4, 2);
        // DW
        self.q(midx, 0, 3);
        self.q(6, 5, 3);
        self.q(0, 6, 3);
        self.q(5, 6, 3);
        self.q(2, midy, 3);
        // TW
        self.q(5, 0, 4);
        self.q(0, 5, 4);
        break;
      case 'Smiley':
        // DL
        self.q(6, 0, 1);
        self.q(2, 2, 1);
        self.q(0, 6, 1);
        self.m(4, 4, 1);
        self.m(5, 4, 1);
        self.m(4, 5, 1);
        self.m(4, 6, 1);
        self.m(5, 6, 1);
        self.m(6, 11, 1);
        // TL
        self.q(3, 1, 2);
        self.q(1, 3, 2);
        self.m(5, 5, 2);
        self.m(4, 10, 2);
        // DW
        self.q(midx, 0, 3);
        self.q(4, 1, 3);
        self.q(1, 4, 3);
        self.q(0, midy, 3);
        self.m(3, 9, 3);
        self.m(5, 11, 3);
        self.m(7, 11, 3);
        // TW
        self.q(5, 0, 4);
        self.q(0, 5, 4);
        break;
      case 'Yin Yang':
        // DL
        for (var i = 5; i < 9; ++i) {
          self.boardm[i][1] = 1;
        }
        for (var i = 3; i < 10; ++i) {
          self.boardm[i][2] = 1;
        }
        for (var i = 2; i < 11; ++i) {
          self.boardm[i][3] = 1;
          self.boardm[i][4] = 1;
        }
        for (var i = 1; i < 11; ++i) {
          self.boardm[i][5] = 1;
        }
        for (var i = 1; i < 10; ++i) {
          self.boardm[i][6] = 1;
        }
        for (var i = 1; i < 7; ++i) {
          self.boardm[i][7] = 1;
        }
        for (var i = 1; i < 5; ++i) {
          self.boardm[i][8] = 1;
        }
        for (var i = 1; i < 4; ++i) {
          self.boardm[i][9] = 1;
        }
        for (var i = 2; i < 4; ++i) {
          self.boardm[i][10] = 1;
          self.boardm[i][11] = 1;
        }
        for (var i = 3; i < 5; ++i) {
          self.boardm[i][12] = 1;
        }
        for (var i = 7; i < 9; ++i) {
          self.boardm[i][10] = 1;
          self.boardm[i][11] = 1;
        }
        for (var i = 6; i < 8; ++i) {
          self.boardm[i][3] = 0;
          self.boardm[i][4] = 0;
        }
        self.boardm[5][13] = 1;
        // TL
        self.q(4, 1, 2);
        self.q(2, 2, 2);
        self.q(1, 4, 2);
        // DW
        self.q(6, 0, 3);
        self.q(midx, 0, 3);
        self.q(3, 1, 3);
        self.q(1, 3, 3);
        self.q(0, 6, 3);
        self.q(0, midy, 3);
        // TW
        self.q(5, 0, 4);
        self.q(0, 5, 4);
        break;
      case 'Random':
        var aBonuses = [24, 12, 16, 8];
        var nX, nY;
        for (var i = 0; i < aBonuses.length; ++i) {
          while (aBonuses[i] > 0) {
            nX = randInt(0, 14);
            nY = randInt(0, 14);
            if (self.boardm[nX][nY] || (nX === midx && nY === midy)) continue;
            self.boardm[nX][nY] = i + 1;
            --aBonuses[i];
          }
        }
        break;
      default:
        for (var i = 0; i < midx; ++i) {
          for (var j = 0; j < midy; ++j) {
            var dist = bx * by - i - j;
            if (dist % 8 === 0) {
              self.q(i, j, 1); // DL
            } else {
              if (dist % 11 === 0) self.q(i, j, 2); // TL
              else if (dist % 7 === 0) self.q(i, j, 3); // DW
            }
          }
        }
        self.q(midx, 0, 3);
        self.q(0, midy, 3);
        self.q(0, 1, 0);
        self.q(0, 2, 4);
        self.q(1, 0, 0);
        self.q(1, 1, 3);
        self.q(2, 0, 1);
        self.q(2, 5, 3);
        self.q(2, 6, 0);
        self.q(3, 5, 0);
        self.q(4, 1, 4);
        self.q(4, 4, 0);
        self.q(4, 7, 3);
        self.q(5, 2, 3);
        self.q(5, 3, 0);
        self.q(6, 5, 2);
        self.q(8, 2, 0);
    }

    g_boardmults = self.boardm;
    return self.boardm;
  };

  // Set horizontal mirror
  self.m = function(x, y, s) {
    self.boardm[x][y] = s;
    self.boardm[self.bx - x - 1][y] = s;
  };

  // Set quadrant
  self.q = function(x, y, s) {
    var x1 = x;
    var y1 = y;
    var x2 = self.bx - x - 1;
    var y2 = self.by - y - 1;
    self.boardm[x1][y1] = s;
    self.boardm[x1][y2] = s;
    self.boardm[x2][y1] = s;
    self.boardm[x2][y2] = s;
  };
}

var g_boardm = new BonusesLayout(localStorage['layout']);