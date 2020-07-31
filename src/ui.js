// Assumptions:
// 1. redipsdrag.js has already been included
// 2. g_boardm exists and its init method returns the bonus layout (defined in bonuses.js)

// VDict callback function
function cb(data) {
  g_def = data.result;
}

// Get element
function el(id) {
  return document.getElementById(id) || document.querySelector(id);
}

// Native JavaScript JSONP implementation
function getJsonp(sUrl, callback) {
  // Insert script tag to load external JS containing padded JSON
  var oJson,
    nTimestamp = Date.now(),
    sCallback = 'handleJsonp' + nTimestamp,
    sId = 'getjson-' + nTimestamp,
    cleanUp = function() {
      el(sId).remove();
      delete window[sCallback];
    },
    js = document.createElement('script');
  js.id = sId;
  js.src = sUrl.replace(/=\?/, '=' + sCallback);
  js.onload = function() {
    if (typeof callback === 'function') callback(oJson);
    cleanUp();
  };
  js.onerror = function() {
    console.warn('Error retrieving data from ' + sUrl);
    cleanUp();
  };
  window[sCallback] = function(o) {
    oJson = o;
  };
  document.head.appendChild(js);
}

// Return a random integer between nMin and nMax (inclusive)
function randInt(nMin, nMax) {
  return Math.floor(Math.random() * (nMax - nMin + 1) + nMin);
}

// Set language
function setLang(sLang) {
  var bConfirm = confirm(t('This will restart the game.'));
  if (bConfirm) {
    setStorage('lang', sLang);
    // GA
    gtag('event', sLang, {
      'event_category': 'Language'
    });
    location.reload();
  }
}

// Set tileset
function setTileset(elSelect) {
  var bConfirm = confirm(t('This will restart the game.'));
  if (bConfirm) {
    setStorage('tileset', elSelect.value);
    // GA
    gtag('event', elSelect.value, {
      'event_category': 'Tileset'
    });
    location.reload();
  } else {
    elSelect.selectedIndex = 0;
  }
}

// Modal functions
function showModal(html, width) {
  g_cache['modalContent'].innerHTML = html;
  g_cache['modalMask'].style.display = 'block';
  if (parseFloat(width)) g_cache['modalContainer'].style.width = width + 'px';
  g_cache['modalContainer'].style.display = 'block';
  g_cache['modalContainer'].style.marginTop = '-' + ((g_cache['modalContainer'].clientHeight - 13) / 2) + 'px'; // 13px for the titlebar
  setTimeout(function() {
    // Autofocus on first input or button
    var elControl = g_cache['modalContent'].querySelector('input, button');
    if (elControl) elControl.focus();
    g_cache['modalMask'].classList.add('on');
    g_cache['modalContainer'].classList.add('on');
  }, 0);
  // Set focus trap
  [].forEach.call(g_cache['app'].querySelectorAll('a[href], button'), function(el) {
    el.tabIndex = -1;
  });
}
function hideModal() {
  g_cache['modalContainer'].classList.remove('on');
  g_cache['modalMask'].classList.remove('on');
  g_bui.timer = setTimeout(function() {
    g_cache['modalContainer'].style.display = 'none';
    g_cache['modalMask'].style.display = 'none';
  }, 300); // Sync with transition time
  // Remove focus trap
  [].forEach.call(g_cache['app'].querySelectorAll('a[href], button'), function(el) {
    el.tabIndex = 0;
  });
}

// Main UI logic
function RedipsUI() {
  var self = this;

  self.created = false;
  self.racksize = 7;
  self.plrRackId = 'pl';
  self.oppRackId = 'op';
  self.boardId = 'c';
  self.newplays = {};
  self.racks = [];
  self.racks[1] = [];
  self.racks[2] = [];
  self.firstrack = true;
  self.cellbg = '#e0e0b0';
  self.level = getStorage('level') || 1; // Playing level
  self.hlines = '';    // Play hisory lines
  self.hcount = 0;     // Play history count
  self.showOpRack = 1; // 0=hidden, 1=visible

  self.acceptPlayerPlacement = function() {
    self.newplays = {};
    self.makeTilesFixed();
  };

  self.addToHistory = function(words, player) {
    if (player !== 1 && player !== 2) player = 1;
    player = player - 1;
    ++self.hcount;
    var html = '<table>';
    for (var i = 0; i < words.length; ++i) {
      var word = words[i];
      html += '<tr class="player-' + player + '">';
      html += '<td>' + word.toUpperCase() + '</td><td>';
      html += '<a class="link" title="' + t('Show definition') + '" aria-label="' + t('Show definition') + '" onclick="g_bui.wordInfo(\'' + word + '\')"><img src="pics/info.png" alt=""></a>';
      html += '</td></tr>';
    }
    html += '</table>';
    self.hlines += html;
    var div = el('history');
    div.innerHTML = self.hlines;
    div.scrollTop = self.hcount * 100;

    // GA
    if (words.length > 0) {
      // Delay required to get actual score
      setTimeout(function() {
        if (player === 0) {
          gtag('event', 'Player Move', {
            'event_category': 'Gameplay - Lvl ' + (g_playlevel + 1),
            'event_label': words.join(', '),
            'value': +el('lpscore').textContent
          });
        } else {
          gtag('event', 'Computer Move', {
            'event_category': 'Gameplay - Lvl ' + (g_playlevel + 1),
            'event_label': words.join(', '),
            'value': +el('loscore').textContent
          });
        }
      }, 100);
    }
  };

  self.animDone = function() {
    --self.animTiles;
    self.playSound();
    //console.log('Animations left: ' + self.animTiles);
    if (self.animTiles === 0) {
      // Last opponent tile animated to its position; return original
      // show/hide state of tiles set to visible before animation.
      /*
      if (self.showOpRack === 0) {
        for (var i = 0; i < self.displayedcells.length; ++i) {
          //self.displayedcells[i].style.display = 'none';
        }
      }
      */
      self.animCallback();
    }
  };

  self.cancelPlayerPlacement = function() {
    var placement = self.getPlayerPlacement();
    var divs = [];
    var id;
    for (var i = 0; i < placement.length; ++i) {
      var pl = placement[i];
      id = self.boardId + pl.x + '_' + pl.y;
      var cell = el(id);
      //if (cell.firstChild==null || typeof(cell.firstChild)=="undefined") alert("baaaaa");
      divs.push(cell.firstChild);
      cell.holds = '';
      cell.innerHTML = '';
    }
    var count = 0;
    for (var i = 0; i < self.racksize; ++i) {
      id = self.plrRackId + i;
      var rcell = el(id);
      if (rcell.holds === '' && count < divs.length) {
        var div = divs[count++];
        // Joker tile - remove previously selected letter from tile?
        if (div.holds.points === 0) div.innerHTML = '';
        rcell.appendChild(div);
        rcell.holds = self.hcopy(div.holds);
      }
    }
    self.newplays = [];
  };

  self.create = function(iddiv, bx, by, scores, racksize) {
    if (self.created) return;

    self.boardm = g_boardm.init(bx, by);
    var hr = '<tr class="ruler"><td colspan="2"></td></tr>';
    var html = '<table><tr><td><div id="board" class="human-computer"></div>';

    html += '</td><td id="score">';
    html += '<table class="gameinfo">';

    html += '<tr class="heading"><th colspan="2">';
    html += t('Words Played') + '</th></tr>';
    html += '<tr><td colspan="2">';
    html += '<div id="history">';
    html += '</div></td></tr>';
    html += hr;

    html += '<tr><td>' + t('Level:') + '</td><td>';
    html += '<span id="level" title="' + t('Computer can score up to ') + g_maxwpoints[g_playlevel] + t(' points per turn') + '">' + (g_playlevel + 1) + '</span>';
    html += '&nbsp;<a class="link" title="' + t('Increase difficulty') + '" aria-label="' + t('Increase difficulty') + '" onclick="g_bui.levelUp()">';
    html += '<img src="pics/up.png" alt=""></a>';
    html += '<a class="link" title="' + t('Decrease difficulty') + '" aria-label="' + t('Decrease difficulty') + '" onclick="g_bui.levelDn()">';
    html += '<img src="pics/dn.png" alt=""></a></td>';

    var sTileset = g_tilesets.indexOf(g_tileset) > -1 ? g_tileset : t('Default');
    var sSelect = '<select title="' + sTileset + '" onchange="setTileset(this)"><option>' + sTileset + '</option>';
    if (sTileset !== t('Default')) sSelect += '<option value="default">' + t('Default') + '</option>';
    for (var i = 0; i < g_tilesets.length; ++i) {
      if (g_tilesets[i] === sTileset) continue;
      sSelect += '<option>' + g_tilesets[i] + '</option>';
    }
    sSelect += '</select>';
    html += '<tr><td>' + t('Tileset:') + '</td><td>' + sSelect + '</td></tr>';
    html += hr;

    html += '<tr><td>' + t('Computer&rsquo;s last score:') + '</td><td id="loscore">0</td></tr>';
    html += '<tr class="highlight"><td>' + t('Computer&rsquo;s total score:') + '</td>';
    html += '<td id="oscore">0</td></tr>';
    html += hr;

    html += '<tr><td>' + t('Your last score:') + '</td><td id="lpscore">0</td></tr>';
    html += '<tr class="highlight"><td>' + t('Your total score:') + '</td>';
    html += '<td id="pscore">0</td></tr>';
    html += hr;

    html += '<tr><td>' + t('Tiles left:') + '</td><td id="tleft"></td></tr>';
    html += hr;

    html += '</table>';
    html +=
      '<div id="footer">' +
      (getStorage('lang') === 'vi' ?
        '<a href="javascript:setLang(\'en\')">' + t('English') + '</a> | ' + t('Vietnamese') :
        t('English') + ' | <a href="javascript:setLang(\'vi\')">' + t('Vietnamese') + '</a>') + '<br>' +
      t('Feedback?') + ' <a href="mailto:feedback@vietboard.org?subject=Vietboard">feedback@vietboard.org</a>' +
      '</div>';

    html += '</td></tr></table>';
    g_cache['app'].innerHTML = html;

    self.scores = scores;

    self.created = true;
    self.racksize = racksize;

    self.bx = bx;
    self.by = by;

    html = '<div id="drag">';
    //---------------------------
    // Opponent's rack

    html += '<table class="opponent"><tr>';
    if (DEBUG) html += '<td class="mark"><button id="toggle" class="obutton" onclick="g_bui.toggleORV()"></button></td>';

    for (var i = 0; i < racksize; ++i) {
      html += '<td id="' + self.oppRackId + i + '"></td>';
    }
    html += '</tr></table>';

    //---------------------------
    // Playing board
    var st = self.getStartXY();
    var mults = ['', 'DL', 'TL', 'DW', 'TW'];
    var mult;

    html += '<table class="board">';
    for (var i = 0; i < by; ++i) {
      html += '<tr>';
      for (var j = 0; j < bx; ++j) {
        html += '<td id="c' + j + '_' + i + '" ';
        mult = '';
        mult = (j === st.x && i === st.y) ? 'ST' : mults[self.boardm[j][i]];
        if (mult !== '') mult = 'class="' + mult + '"';
        html += mult + '></td>';
      }
      html += '</tr>';
    }
    html += '</table>';

    //---------------------------
    // Player's rack
    html += '<table class="player"><tr>';
    for (var i = 0; i < racksize; ++i) {
      html += '<td id="' + self.plrRackId + i + '"></td>';
    }
    //---------------------------

    html += '<td class="mark">';
    html += '<button id="play" class="button" onclick="onPlayerMoved(false)">' + t('Play') + '</button></td>';

    html += '<td class="mark">';
    html += '<button id="pass" class="obutton" onclick="onPlayerMoved(true)">' + t('Pass') + '</button></td>';

    html += '<td class="mark">';
    html += '<button class="obutton" onclick="onPlayerClear()">' + t('Clear') + '</button></td>';

    html += '<td class="mark">';
    html += '<button class="obutton" onclick="onPlayerSwap()">' + t('Swap') + '</button></td>';

    html += '</tr></table>';
    html += '</div>';

    el(iddiv).innerHTML = html;

    // Initialize custom DOM "holds" property
    for (var i = 0; i < racksize; ++i) {
      var idp = self.plrRackId + i;
      var ido = self.oppRackId + i;
      el(idp).holds = '';
      el(ido).holds = '';
    }
    for (var i = 0; i < by; ++i) {
      for (var j = 0; j < bx; ++j) {
        var idc = self.boardId + j + '_' + i;
        el(idc).holds = '';
      }
    }

    // Hide opponent's rack
    if (DEBUG) self.toggleORV();

    // Initialize REDIPS framework
    self.rd = REDIPS.drag;
    self.initRedips();
  };

  self.fixPlayerTiles = function() {
    for (var i = 0; i < self.racks[1].length; ++i) {
      var idp = self.plrRackId + i;
      var divp = el(idp).firstChild;
      if (divp) self.rd.enableDrag(false, divp);
    }
  };

  self.getBoard = function() {
    var board = [];
    var boardp = [];
    for (var x = 0; x < self.bx; ++x) {
      board[x] = [];
      boardp[x] = [];
      for (var y = 0; y < self.by; ++y) {
        var id = self.boardId + x + '_' + y;
        var obj = el(id);
        //obj.style.backgroundColor = self.cellbg;
        var letter = '';
        var points = 0;
        if (obj.holds !== '') {
          letter = obj.holds.letter;
          points = obj.holds.points;
        }
        board[x][y] = letter;
        boardp[x][y] = points;
      }
    }
    return {
      'board': board,
      'boardp': boardp
    };
  };

  self.getOpponentRack = function() {
    return self.racks[2];
  };

  self.getPlayerPlacement = function() {
    var placement = [];
    var played = self.newplays;
    for (var l in played) {
      var sc = l.substr(1);
      var co = sc.split('_');
      placement.push({
        'ltr': played[l].letter,
        'lsc': played[l].points,
        'x': +co[0],
        'y': +co[1]
      });
    }
    return placement;
  };

  self.getPlayerRack = function() {
    return self.racks[1];
  };

  self.getPlayLevel = function() {
    return self.level - 1;
  };

  self.getStartXY = function() {
    // Starting position is center of board
    var fx = Math.round(self.bx / 2) - 1;
    var fy = Math.round(self.by / 2) - 1;
    return {
      'x': fx,
      'y': fy
    };
  };

  self.hcopy = function(pholds) {
    if (pholds === undefined || pholds === '' || pholds === null) return '';
    return {
      'letter': pholds.letter,
      'points': pholds.points
    };
  };

  self.initRedips = function() {
    self.rd.init();
    self.rd.dropMode = 'single';
    //self.rd.style.borderDisabled = 'solid'; // Border style for disabled element unchanged
    self.rd.animation.pause = g_animation; // Set animation loop pause

    self.rd.event.dropped = function() {
      //console.log(self.rd.obj.holds);
      var holds = self.hcopy(self.rd.obj.holds);
      self.rd.td.target.holds = holds;
      var id = self.rd.td.target.id;
      var sc = self.rd.td.source.id.charAt(0);
      if (id.charAt(0) === self.boardId) {
        // Tile dropped on playing board
        if (holds !== '' &&      // Should never happen
          holds.points === 0 &&  // Joker
          sc !== self.boardId) { // Taken from rack to board
          self.showLettersModal(id);
          return;
        }
        self.newplays[id] = self.hcopy(holds);
        self.playSound();
      } else
        if (id.charAt(0) === 'p') {
          // Tile dropped on player rack
          if (holds !== '' &&      // Should never happen
            holds.points === 0 &&  // Joker
            sc === self.boardId) { // Taken board to rack
            // Remove selected letter from joker tile
            self.rd.obj.innerHTML = '';
            self.rd.obj.holds = {
              'letter': '',
              'points': 0
            };
          }
        }
    };
    self.rd.event.moved = function() {
      self.rd.td.source.holds = '';
      var id = self.rd.td.source.id;
      // Tile lifted from playing board
      if (id.charAt(0) === self.boardId) delete self.newplays[id];
    };
  };

  self.levelDn = function() {
    if (self.level > 1) --self.level;
    el('level').textContent = self.level;
    el('level').title = t('Computer can score up to ') + g_maxwpoints[self.level - 1] + t(' points per turn');
    setStorage('level', self.level);
  };

  self.levelUp = function() {
    if (self.level < g_maxwpoints.length) ++self.level;
    el('level').textContent = self.level;
    el('level').title = t('Computer can score up to ') + g_maxwpoints[self.level - 1] + t(' points per turn');
    setStorage('level', self.level);
  };

  self.makeTilesFixed = function() {
    self.rd.enableDrag(false, '#drag div');
    for (var i = 0; i < self.racks[1].length; ++i) {
      var idp = self.plrRackId + i;
      var ido = self.oppRackId + i;
      var divo = el(ido).firstChild;
      if (divo) self.rd.enableDrag(false, divo);
      var divp = el(idp).firstChild;
      if (divp) self.rd.enableDrag(true, divp);
    }
  };

  self.onSelLetter = function(ltr) {
    var holds = {
      'letter': ltr,
      'points': 0
    };
    self.newplays[self.bdropCellId] = holds;
    var cell = el(self.bdropCellId);
    cell.holds = self.hcopy(holds);
    var html = '';
    //html += '<div class="drag t1">';
    html += ltr.toUpperCase() + '<sup><small>&nbsp;</small></sup>';
    //html += '</div>';
    //cell.innerHTML = html;
    var div = cell.firstChild;
    div.holds = self.hcopy(holds);
    div.innerHTML = html;
    hideModal();
  };

  self.onSwap = function(cancel) {
    var keep = '';
    var swap = '';

    if (cancel) {
      keep = self.getPlayerRack();
    } else {
      for (var i = 0; ; ++i) {
        var swapc = el('swap-candidate' + i);
        if (!swapc) break;
        if (swapc.firstChild) {
          if (swapc.firstChild && swapc.classList.contains('to-swap')) swap += swapc.firstChild.holds.letter;
          else keep += swapc.firstChild.holds.letter;
        }
      }
    }

    //console.log('onSwap', keep, swap);

    // Either I'm not using REDIPS correctly or having the two tile swapping
    // tables somehow messes up its internal table monitoring mechanism.
    // Without the two lines below, that tell REDIPS to forget about the
    // swap racks and reread the board and player/opponent rack tables, the
    // move animation thinks the target table is the swap rack instead of
    // the board table, causing havoc.
    //el('swaptable').innerHTML = '';
    //self.initRedips();

    hideModal();
    onPlayerSwapped(keep, swap);
  };

  /*
  self.opponentPlay = function(x, y, lt, lts) {
    // TODO: add animation, etc.
    var cell = el(self.boardId + x + '_' + y);
    cell.holds = {
      'letter': lt,
      'points': lts
    };

    var ltru = lt.toUpperCase();
    var html = '<div class="drag t2">' + ltru;

    if (lts === 0) lts = '&nbsp;';

    html += '<sup><small>' + lts + '</small></sup>';
    html += '</div>';
    cell.innerHTML = html;
    cell.style.backgroundColor = '#ff0'; // Yellow
  };
  */

  self.playOpponentMove = function(placements, callback) {
    // Placements is an array of letter placement information for the
    // opponent move. It consists of:
    //
    // ltr: the letter to place
    // lscr: the letter's score
    // x: the x board position to place the letter
    // y: the y board position to place the letter
    //
    // dlet is a dictionary of arrays, where each letter played maps to a
    // different array. The size of the array is the number of times the
    // same letter was played in a move.

    var orack = self.racks[2];
    // newrack will be oponent's rack after the value of the joker tiles has
    // been determined.
    var newrack = orack;
    var dlet = {};
    if (DEBUG) console.log('Placements:', placements);
    for (var i = 0; i < placements.length; ++i) {
      var placement = placements[i];
      var l = placement.ltr;
      if (l in dlet) dlet[l].push(placement);
      else dlet[l] = [placement];
      // If letter is not on rack, then a joker is used. Put a letter in
      // the blank tile before it is animating to the board. After the
      // process below, orack will be a string of the original opponent
      // rack with all the letters used in the opponent word converted to _.
      if (orack.search(l) === -1) {
        var jpos = orack.search('\\*');
        // Replace joker symbol with a different symbol
        orack = orack.replace('*', '_');
        // Expose joker letter value in new rack
        newrack = newrack.replace('*', l);
        var orcellid = self.oppRackId + jpos;
        var rcell = el(orcellid);
        var html = '<div class="drag t2">' + l.toUpperCase();
        html += '<sup><small>&nbsp;</small></sup>';
        html += '</div>';
        rcell.innerHTML = html;
      } else {
        orack = orack.replace(l, '_');
      }
    }

    if (DEBUG) console.log('Dictionary of letter arrays:', dlet);

    // Go over each letter in the current opponent rack each time a letter
    // exists in the move dictionary (dlet), animate it to its position on
    // the board, and then decrement its count in the dictionary.
    self.displayedcells = [];
    var rack = newrack.split('');

    function moveletter(info, wait) {
      setTimeout(function() {
        self.rd.moveObject(info);
      }, wait);
    }

    self.fixPlayerTiles();
    var lettermoves = [];
    for (var i = 0; i < rack.length; ++i) {
      var rlet = rack[i];
      if (rlet in dlet && dlet[rlet].length > 0) {
        // Get the placement info for this letter
        var move = dlet[rlet][0];
        // And position of the corresponding letter on opponent's rack
        var opid = self.oppRackId + i;
        // And the target cell information
        var cellId = self.boardId + move.x + '_' + move.y;
        var orcell = el(opid);
        orcell.style.display = '';
        self.displayedcells.push(orcell);
        var div = orcell.firstChild;
        var cell = el(cellId);
        div.holds = {
          'letter': move.ltr,
          'points': move.ltscr
        };
        //cell.innerHTML = "<div class='drag'></div>";
        // Update what the target cell will contain
        self.animTiles = placements.length;
        self.animCallback = callback;
        var moveinfo = {
          'obj': div,
          'target': cell,
          'callback': self.animDone
        };
        lettermoves.push({
          'info': moveinfo,
          'x': move.x,
          'y': move.y
        });
        cell.holds = {
          'letter': move.ltr,
          'points': move.lscr
        };
        // Remove the placement element for this letter
        dlet[rlet].splice(0, 1);
      }
    }

    // Now animate the letters to their correct position in the board by the
    // order in which they appear in the word. For this we need to sort the
    // letters to animate according to their position in the word.
    function compareByX(a, b) {
      return a.x - b.x;
    }

    function compareByY(a, b) {
      return a.y - b.y;
    }

    var totalanims = lettermoves.length;
    if (totalanims > 1) {
      if (lettermoves[0].x !== lettermoves[1].x) lettermoves.sort(compareByX);
      else lettermoves.sort(compareByY);
    }
    for (var i = 0; i < totalanims; ++i) {
      // Set the the time to wait before animating this letter to its
      // position on the board
      var wait = g_wait * i;
      // Create a separate instance of the letter info local to the
      // function and set the timer to move the letter by activating this
      // function
      moveletter(lettermoves[i].info, wait);
    }
  };

  self.playSound = function() {
    g_cache['sound'].play();
  };

  self.prompt = function(msg, button) {
    showModal(
      msg +
      '<div class="buttons">' +
      (button || '<button class="button" onclick="hideModal()">' + t('OK') + '</button>') +
      '</div>'
    );
  };

  self.removeFromOpponenentRack = function(letters) {
    self.removeFromRack(2, letters);
  };

  self.removeFromPlayerRack = function(letters) {
    self.removeFromRack(1, letters);
  };

  self.removeFromRack = function(pl, letters) {
    // Remove letters from player or opponent racks
    // pl: 1=player, 2=opponent
    // letters: array of letters to remove

    var dlet = {};
    for (var i = 0; i < letters.length; ++i) {
      var l = letters.charAt(i);
      if (l in dlet) ++dlet[l];
      else dlet[l] = 1;
    }

    var rack = self.racks[pl].split('');
    for (var i = 0; i < rack.length; ++i) {
      var rlet = rack[i];
      if (rlet in dlet && dlet[rlet] > 0) {
        delete rack[i];
        --dlet[rlet];
      }
    }

    //if (pl === 1) console.log('removeFromRack leaves: ' + rack);
    self.racks[pl] = rack.join('');
  };

  self.setLetters = function(player, letters) {
    self.racks[player] = letters;
    var cells = [];

    // TODO: sanity checks on values of player

    var ifprfx = (player === 1) ? self.plrRackId : self.oppRackId;
    //var upper = letters.toUpperCase();
    var upper = '';
    for (var i = 0; i < letters.length; ++i) {
      upper += letters.charAt(i).toUpperCase();
    }

    for (var i = 0; i < self.racksize; ++i) {
      var id = ifprfx + i;
      var rcell = el(id);
      // Remove the existing drag div?
      if (rcell.firstChild) rcell.removeChild(rcell.firstChild);
      var ltr = i < letters.length ? letters.charAt(i) : '';
      if (ltr !== '') {
        cells.push(rcell);
        var html = '<div class="drag t' + player + '">';
        var holds = {
          'letter': ltr,
          'points': self.scores[ltr]
        };
        rcell.holds = holds;
        if (ltr !== '*') {
          var char = upper.charAt(i);
          html += (char === ' ' ? '&nbsp;&nbsp;' : char) + '<sup><small>' + self.scores[ltr] + '</small></sup>';
        }
        html += '</div>';
        rcell.innerHTML = html;
      } else {
        rcell.holds = '';
      }
    }

    for (i in cells) {
      var div = cells[i].firstChild;
      div.holds = self.hcopy(cells[i].holds);
      //if (player===2) self.rd.enableDrag(false, div);
    }
  };

  self.setPlayerRack = function(letters) {
    self.setLetters(1, letters);
    if (self.firstrack) {
      self.firstrack = false;
      self.initRedips();
    }
  };

  self.setPlayerScore = function(last, total) {
    el('lpscore').textContent = last;
    el('pscore').textContent = total;
  };

  self.setOpponentRack = function(letters) {
    self.setLetters(2, letters);
  };

  self.setOpponentScore = function(last, total) {
    el('loscore').textContent = last;
    el('oscore').textContent = total;
  };

  self.setTilesLeft = function(left) {
    el('tleft').textContent = left;
  };

  self.showBusy = function() {
    showModal(t('Computer thinking, please wait...'));
  };

  self.showLettersModal = function(bdropCellId) {
    self.bdropCellId = bdropCellId;
    var rlen = 6;
    var llen = g_letters.length;
    var html = '';
    for (var i = 0; i < llen; ++i) {
      var ltr = g_letters[i][0];
      if (ltr !== '*') {
        if (html !== '' && i % rlen === 0) html += '</tr><tr>'
        html += '<td><button class="obutton" onclick="g_bui.onSelLetter(\'' + ltr + '\')">';
        html += (ltr === ' ' ? '&nbsp;' : ltr.toUpperCase()) + '</button></td>';
      }
    }
    for (var i = llen;
      (i - 1) % rlen !== 0; ++i) {
      html += '<td></td>';
    }
    html = '<table id="letters"><tr>' + html + '</tr></table>';
    showModal(html);
  };

  self.showSwapModal = function(tilesLeft) {
    var divs = [];
    var html = '<table id="swaptable" title="' + t('Select the letters you want to swap') + '"><tr>';
    for (var i = 0; i < self.racksize; ++i) {
      var rcell = el(self.plrRackId + i);
      if (rcell.holds === '') continue;
      divs.push(rcell.firstChild);
      html += '<td id="swap-candidate' + i + '" onclick="this.classList.toggle(\'to-swap\')"></td>';
    }
    html += '</tr></table>';

    // Display the HTML in the modal window
    self.prompt(html, '<button class="button" onclick="g_bui.onSwap()">' + t('Swap') + ' & ' + t('Pass') + '</button>');

    // And then fill the DOM in the modal window with the existing letter
    // divs from the players rack
    for (var i = 0; i < divs.length; ++i) {
      self.rd.enableDrag(false, divs[i]); // Disable drag in order to select
      el('swap-candidate' + i).appendChild(divs[i]);
    }
  };

  self.toggleORV = function() {
    // Toggle opponent rack visibility
    self.showOpRack = 1 - self.showOpRack;
    el('toggle').innerHTML = self.showOpRack ? t('Hide computer&rsquo;s rack') : t('Show computer&rsquo;s rack');
    for (var i = 0; i < self.racksize; ++i) {
      el(self.oppRackId + i).classList.toggle('on', self.showOpRack);
    }
  };

  self.wordInfo = function(word) {
    if (!window.g_defs) {
      alert(t('Word definitions not enabled.'));
      return;
    }

    var link = new RegExp('\\{([a-z]+)=.+\\}');
    var jump = new RegExp('<([a-z]+)=.+>');
    var lword = word;

    // Try to get definition locally first
    if (word in g_defs) {

      var mj;
      while ((mj = g_defs[lword].match(jump)) !== null) {
        lword = mj[1];
        if (!(lword in g_defs)) {
          // Shouldn't happen
          alert(t('Dictionary inconsistency detected.'));
          return;
        }
      }
      var html = g_defs[lword];
      var ml = html.match(link);
      if (ml !== null) {
        var hword = ml[1];
        html = html.replace(link, '<a class="link" title="' + t('Show definition') + '" aria-label="' + t('Show definition') + '" onclick="g_bui.wordInfo(\'' + hword + '\')">' + hword + '</a>');
      }
      html = word.toUpperCase() + ': ' + html;
      self.prompt(html);

      // If it doesn't exist, look it up online
    } else {

      getJsonp('https://m.vdict.com/mobile/dictjson?fromapp=1&word=' + encodeURIComponent(word) + '&dict=2', function() {
        g_def = g_def.replace('href="#"', 'onclick="el(\'audio\').play()" title="' + t('Listen to pronunciation') + '"');
        g_def = g_def.replace(' Suggestions:', '');
        g_def = g_def.replace(/">(.+?) not found/, '"><b>$1</b> ' + t('not found'));
        self.prompt(g_def);

        // GA
        gtag('event', word, {
          'event_category': 'Definition',
          'event_label': g_def.indexOf('</b> not found') < 0 ? 'Found' : 'Not Found'
        });
      });

    }
  };

}

var g_bui = new RedipsUI();