// Assumptions:
// 1. redipsdrag.js has already been included
// 2. g_boardm exists and its init method returns the bonus layout (defined in bonuses.js)
function dget(id) {
  return document.getElementById(id) || (document.querySelector && document.querySelector(id));
}

// VDict callback function
function cb(data) {
  g_def = data.result;
}

// Native JavaScript JSONP implementation
function getJsonp(sUrl, callback) {
  // Insert script tag to load external JS containing padded JSON
  var oJson,
    nTimestamp = Date.now(),
    sCallback = 'handleJsonp' + nTimestamp,
    sId = 'getjson-' + nTimestamp,
    cleanUp = function() {
      dget(sId).remove();
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

function getStorage(key) {
  if (window.localStorage) return localStorage[key];
  else return undefined;
}

function setStorage(key, value) {
  if (window.localStorage) {
    localStorage[key] = value;
    return true;
  } else return false;
}

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
  self.rackbg = '#e0f0d0';
  self.level = getStorage('level') || 1; // Playing level
  self.hlines = '';    // Play hisory lines
  self.hcount = 0;     // Play history count
  self.showOpRack = 1; // 0=hidden, 1=visible

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
        var hyperlink = '<span class="link" onclick="g_bui.wordInfo(\'';
        hyperlink += hword + '\')"';
        hyperlink += 'style="text-decoration:underline">' + hword + '</span>';
        html = html.replace(link, hyperlink);
      }
      html = word.toUpperCase() + ': ' + html;
      self.prompt(html);

      // If it doesn't exist, look it up online
    } else {

      getJsonp('https://m.vdict.com/mobile/dictjson?fromapp=1&word=' + encodeURIComponent(word) + '&dict=2', function() {
        g_def = g_def.replace('href="#"', 'onclick="dget(\'audio\').play()" title="' + t('Listen to pronunciation') + '"');
        g_def = g_def.replace(' Suggestions:', '');
        g_def = g_def.replace(/">(.+?) not found/, '"><b>$1</b> not found');
        self.prompt(g_def);

        // GA
        gtag('event', word, {
          'event_category': 'Definition',
          'event_label': g_def.indexOf('</b> not found') < 0 ? 'Found' : 'Not Found'
        });
      });

    }
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
      html += '<span class="link" title="' + t('Show definition') + '" onclick="g_bui.wordInfo(\'' + word + '\')"><img src="pics/info.png" alt=""></span>';
      html += '</td></tr>';
    }
    html += '</table>';
    self.hlines += html;
    var div = dget('history');
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
            'value': +dget('lpscore').textContent
          });
        } else {
          gtag('event', 'Computer Move', {
            'event_category': 'Gameplay - Lvl ' + (g_playlevel + 1),
            'event_label': words.join(', '),
            'value': +dget('loscore').textContent
          });
        }
      }, 100);
    }
  };

  self.levelUp = function() {
    if (self.level < g_maxwpoints.length) ++self.level;
    dget('idlevel').innerHTML = self.level;
    dget('idlevel').title = t('Computer can score up to ') + g_maxwpoints[self.level - 1] + t(' points per turn');
    setStorage('level', self.level);
  };

  self.levelDn = function() {
    if (self.level > 1) --self.level;
    dget('idlevel').innerHTML = self.level;
    dget('idlevel').title = t('Computer can score up to ') + g_maxwpoints[self.level - 1] + t(' points per turn');
    setStorage('level', self.level);
  };

  self.getPlayLevel = function() {
    return self.level - 1;
  };

  self.playSound = function(soundfile) {
    dget('sound').play();
  };

  self.create = function(iddiv, bx, by, scores, racksize) {
    if (self.created)
      return;

    self.boardm = g_boardm.init(bx, by);
    var hr = '<tr class="ruler"><td colspan="2"></td></tr>';
    var html = '<table><tr><td><div id="idBoard"></div>';

    html += '</td><td class="score" valign="top">';
    html += '<table class="gameinfo">';

    html += hr;
    html += '<tr class="heading"><td colspan="2" align="left">';
    html += t('Words played:') + '</td></tr>';
    html += '<tr><td colspan="2" align="left">';
    html += '<div class="scroller" id="history">';
    html += '</div></td></tr>';
    html += hr;

    html += '<tr><td>' + t('Playing at level:') + '</td><td>';
    html += '<span id="idlevel" title="' + t('Computer can score up to ') + g_maxwpoints[g_playlevel] + t(' points per turn') + '">' + (g_playlevel + 1) + '</span>';
    html += '&nbsp;<span class="link" title="' + t('Increase difficulty') + '" onclick="g_bui.levelUp()">';
    html += '<img src="pics/up.png" alt="Up"></span>';
    html += '<span class="link" title="' + t('Decrease difficulty') + '" onclick="g_bui.levelDn()">';
    html += '<img src="pics/dn.png" alt="Down"></span>';
    html += hr;

    html += '<tr><td>' + t('Computer last score:') + '</td><td id="loscore">0</td></tr>';
    html += '<tr class="highlight"><td>' + t('Computer total score:') + '</td>';
    html += '<td id="oscore"><b>0</b></td></tr>';
    html += hr;

    html += '<tr><td>' + t('Your last score:') + '</td><td id="lpscore">0</td></tr>';
    html += '<tr class="highlight"><td>' + t('Your total score:') + '</td>';
    html += '<td id="pscore"><b>0</b></td></tr>';
    html += hr;

    html += '<tr><td>' + t('Tiles left:') + '</td><td id="tleft"></td></tr>';
    html += hr;

    html += '</table>';
    html +=
      '<div id="footer">' +
      (getQueryStringValue('lang') === 'vi' ?
        '<a href="/play/">' + t('English') + '</a> | ' + t('Vietnamese') :
        t('English') + ' | <a href="index.html?lang=vi">' + t('Vietnamese') + '</a>') + '<br><br>' +
      t('Feedback?') + ' <a href="mailto:winter1977@gmail.com?subject=Vietboard">winter1977@gmail.com</a>' +
      '</div>';
    html += '</td></tr></table>';
    dget('uidiv').innerHTML = html;

    self.scores = scores;

    self.created = true;
    self.racksize = racksize;

    self.bx = bx;
    self.by = by;

    html = '<div id="drag">';
    //---------------------------
    // Opponent's rack

    html += '<table class="opponent"><tr><td bgcolor="' + self.rackbg + '" class="marked">';
    html += '<span id="togglebtn" class="obutton" ';
    html += 'onclick="g_bui.toggleORV()"></span></td>';

    for (var i = 0; i < racksize; ++i) {
      html += '<td id="' + self.oppRackId + i;
      html += '" bgcolor="' + self.rackbg + '" holds=""></td>';
    }
    html += '</tr></table>';
    //html += "<br>";

    //---------------------------
    // Playing board
    var st = self.getStartXY();
    var mults = ['', 'DL', 'TL', 'DW', 'TW'];
    var mult;

    html += '<table class="board">';
    for (var i = 0; i < by; ++i) {
      html += '<tr>';
      for (var j = 0; j < bx; ++j) {
        html += '<td bgcolor="' + self.cellbg + '" id="c' + j + '_' + i + '" ';
        mult = '';
        if (j === st.x && i === st.y)
          mult = 'ST';
        else
          mult = mults[self.boardm[j][i]];
        if (mult !== '')
          mult = 'class="' + mult + '"';
        html += mult + '></td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    //html += "<br>";

    //---------------------------
    // Player's rack
    html += '<br><center><table><tr>';
    for (var i = 0; i < racksize; ++i) {
      html += '<td id="' + self.plrRackId + i;
      html += '" bgcolor="' + self.rackbg + '" holds=""></td>';
    }
    //---------------------------

    html += '<td class="marked" bgcolor="' + self.rackbg + '" >';
    html += '<span class="button" ';
    html += 'onclick="onPlayerMoved(false)">' + t('Play') + '</span></td>';

    html += '<td class="marked" bgcolor="' + self.rackbg + '" >';
    html += '<span class="obutton" ';
    html += 'onclick="onPlayerMoved(true)">' + t('Pass') + '</span></td>';

    html += '<td class="marked" bgcolor="' + self.rackbg + '" >';
    html += '<span class="obutton" ';
    html += 'onclick="onPlayerClear()">' + t('Clear') + '</span></td>';

    html += '<td class="marked" bgcolor="' + self.rackbg + '" >';
    html += '<span class="obutton" ';
    html += 'onclick="onPlayerSwap()">' + t('Swap') + '</span></td>';

    html += '</tr></table></center>';

    html += '</div>';
    dget(iddiv).innerHTML = html;

    // Initialize custom DOM "holds" property
    for (var i = 0; i < racksize; ++i) {
      var idp = self.plrRackId + i;
      var ido = self.oppRackId + i;
      dget(idp).holds = '';
      dget(ido).holds = '';
    }
    for (var i = 0; i < by; ++i) {
      for (var j = 0; j < bx; ++j) {
        var idc = self.boardId + j + '_' + i;
        dget(idc).holds = '';
      }
    }

    // Hide opponent's rack
    self.toggleORV();

    // Initialize REDIPS framework
    self.rd = REDIPS.drag;
    self.initRedips();
  };

  self.toggleORV = function() {
    // Toggle opponent rack visibility
    self.showOpRack = 1 - self.showOpRack;
    var buttontxt = [];
    buttontxt[0] = t('Show computer\'s rack');
    buttontxt[1] = t('Hide computer\'s rack');
    var tbtn = dget('togglebtn');
    tbtn.innerHTML = buttontxt[self.showOpRack];
    var toggle = ['none', ''];
    for (var i = 0; i < self.racksize; ++i) {
      var ido = self.oppRackId + i;
      var tdo = dget(ido);
      tdo.style.display = toggle[self.showOpRack];
    }
  };

  self.getStartXY = function() {
    // Starting position is center of board
    var fx = Math.round(self.bx / 2) - 1;
    var fy = Math.round(self.by / 2) - 1;
    return {
      x: fx,
      y: fy
    };
  };

  self.hcopy = function(pholds) {
    if (pholds === undefined || pholds === '' || pholds === null) return '';
    return {
      letter: pholds.letter,
      points: pholds.points
    };
  };

  self.showBusy = function() {
    showPopWin('<center>' + t('Computer thinking, please wait...') + '</center>');
  };

  self.hideBusy = function() {
    hidePopWin();
  };

  self.onSwap = function() {
    var id;
    var keep = '';
    for (var i = 0;; ++i) {
      id = 'swap_candidate' + i;
      var swapc = dget(id);
      if (swapc === null)
        break;
      if (swapc.firstChild)
        keep += swapc.firstChild.holds.letter;
    }

    var swap = '';
    for (var i = 0;; ++i) {
      id = 'swap' + i;
      var swp = dget(id);
      if (swp === null)
        break;
      if (swp.firstChild)
        swap += swp.firstChild.holds.letter;
    }

    //alert( "keep:"+keep+" swap:"+swap );
    // Either I'm not using REDIPS correctly or having the two tile swapping
    // tables somehow messes up its internal table monitoring mechanism.
    // Without the two lines below, that tell REDIPS to forget about the
    // swap racks and reread the board and player/opponent rack tables, the
    // move animation thinks the target table is the swap rack instead of
    // the board table, causing havoc.
    dget('swaptable').innerHTML = '';
    self.initRedips();

    hidePopWin();
    onPlayerSwapped(keep, swap);
  };

  self.onSelLetter = function(ltr) {
    var holds = {
      letter: ltr,
      points: 0
    };
    self.newplays[self.bdropCellId] = holds;
    var cell = dget(self.bdropCellId);
    cell.holds = self.hcopy(holds);
    var html = '';
    //html += "<div class='drag t1'>";
    html += ltr.toUpperCase() + '<sup><font size="-3">';
    html += '&nbsp;</font></sup>';
    //html += "</div>";
    //cell.innerHTML = html;
    var div = cell.firstChild;
    div.holds = self.hcopy(holds);
    div.innerHTML = html;
    hidePopWin();
  };

  self.showSwapModal = function(tilesLeft) {
    var divs = [];
    var id;
    var html = '<center><div id="drags">';
    html += '<table id="swaptable"><tr bgcolor="#beffbe">';
    for (var i = 0; i < self.racksize; ++i) {
      id = self.plrRackId + i;
      var rcell = dget(id);
      if (rcell.holds === '') continue;
      divs.push(rcell.firstChild);
      html += '<td class="swapc" id="swap_candidate' + i + '"></td>';
    }
    html += '</tr></table>';

    var rackplen = self.getPlayerRack().length;
    var maxswap = rackplen < tilesLeft ? rackplen : tilesLeft;
    //alert( rackplen +" "+ tilesLeft + " " + maxswap)
    html += '<table><tr class="trash">';
    for (var i = 0; i < maxswap; ++i) {
      html += '<td class="swapit" id="swap' + i + '"></td>';
    }
    html += '</tr></table>';
    html += '</div><span class="button" onclick="g_bui.onSwap()">';
    html += t('OK') + '</span></center>';
    // Display the HTML in the modal window
    showPopWin(html);
    // And then fill the DOM in the modal window with the existing letter
    // divs from the players rack
    for (var i = 0; i < divs.length; ++i) {
      id = 'swap_candidate' + i;
      var swapc = dget(id);
      swapc.appendChild(divs[i]);
    }

    self.rd.init('drags');
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
        html += '<td><span class="obutton" onclick="g_bui.onSelLetter(\'' + ltr + '\')">';
        html += (ltr === ' ' ? '&nbsp;' : ltr.toUpperCase()) + '</span></td>';
      }
    }
    for (var i = llen;
      (i - 1) % rlen !== 0; ++i) {
      html += '<td></td>';
    }
    html = '<table id="letters"><tr>' + html + '</tr></table>';
    showPopWin(html);
  };

  self.initRedips = function() {
    self.rd.init();
    self.rd.dropMode = 'single';
    //self.rd.style.borderDisabled = 'solid'; // Border style for disabled element unchanged
    self.rd.animation.pause = g_animation; // Set animation loop pause

    self.rd.event.dropped = function() {
      //logit(self.rd.obj.holds);
      var holds = self.hcopy(self.rd.obj.holds);
      self.rd.td.target.holds = holds;
      var id = self.rd.td.target.id;
      var sc = self.rd.td.source.id.charAt(0);
      if (id.charAt(0) === self.boardId) {
        // Tile dropped on playing board
        if (holds !== '' &&     // Should never happen
          holds.points === 0 && // Joker
          sc !== self.boardId) { // Taken from rack to board
          self.showLettersModal(id);
          return;
        }
        self.newplays[id] = self.hcopy(holds);
        self.playSound();
      } else
      if (id.charAt(0) === 'p') {
        // Tile dropped on player rack
        if (holds !== '' &&     // Should never happen
          holds.points === 0 && // Joker
          sc === self.boardId) { // Taken board to rack
          // Remove selected letter from joker tile
          self.rd.obj.innerHTML = '';
          self.rd.obj.holds = {
            letter: '',
            points: 0
          };
        }
      }
    };
    self.rd.event.moved = function() {
      self.rd.td.source.holds = '';
      var id = self.rd.td.source.id;
      if (id.charAt(0) === self.boardId) {
        // Tile lifted from playing board
        delete self.newplays[id];
      }
    };
  };

  self.opponentPlay = function(x, y, lt, lts) {
    // TODO: add animation, etc.
    var cell = dget(self.boardId + x + '_' + y);
    cell.holds = {
      letter: lt,
      points: lts
    };

    var ltru = lt.toUpperCase();
    var html = '<div class="drag t2">' + ltru;

    if (lts === 0) lts = '&nbsp;';

    html += '<sup><font size="-3">' + lts + '</font></sup>';
    html += '</div>';
    cell.innerHTML = html;
    cell.style.backgroundColor = '#ff0'; // Yellow
  };

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
    logit('Placements:');
    logit(placements);
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
        var rcell = dget(orcellid);
        var html = '<div class="drag t2">' + l.toUpperCase();
        html += '<sup><font size="-3">&nbsp;</font></sup>';
        html += '</div>';
        rcell.innerHTML = html;
      } else {
        orack = orack.replace(l, '_');
      }
    }

    logit('Dictionary of letter arrays:');
    logit(dlet);

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
        var orcell = dget(opid);
        orcell.style.display = '';
        self.displayedcells.push(orcell);
        var div = orcell.firstChild;
        var cell = dget(cellId);
        div.holds = {
          letter: move.ltr,
          points: move.ltscr
        };
        //cell.innerHTML = "<div class='drag'></div>";
        // Update what the target cell will contain
        self.animTiles = placements.length;
        self.animCallback = callback;
        var moveinfo = {
          obj: div,
          target: cell,
          callback: self.animDone
        };
        lettermoves.push({
          info: moveinfo,
          x: move.x,
          y: move.y
        });
        cell.holds = {
          letter: move.ltr,
          points: move.lscr
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

  self.animDone = function() {
    --self.animTiles;
    self.playSound();
    logit('Animations left: ' + self.animTiles);
    if (self.animTiles === 0) {
      // Last opponent tile animated to its position; return original
      // show/hide state of tiles set to visible before animation.
      if (self.showOpRack === 0) {
        for (var i = 0; i < self.displayedcells.length; ++i) {
          self.displayedcells[i].style.display = 'none';
        }
      }
      self.animCallback();
    }
  };

  self.fixPlayerTiles = function() {
    for (var i = 0; i < self.racks[1].length; ++i) {
      var idp = self.plrRackId + i;
      var divp = dget(idp).firstChild;
      if (divp) self.rd.enableDrag(false, divp);
    }
  };

  self.makeTilesFixed = function() {
    self.rd.enableDrag(false, '#drag div');
    for (var i = 0; i < self.racks[1].length; ++i) {
      var idp = self.plrRackId + i;
      var ido = self.oppRackId + i;
      var divo = dget(ido).firstChild;
      if (divo) self.rd.enableDrag(false, divo);
      var divp = dget(idp).firstChild;
      if (divp) self.rd.enableDrag(true, divp);
    }
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

    //if (pl === 1) logit( "removeFromRack leaves " + rack );
    self.racks[pl] = rack.join('');
  };

  self.setTilesLeft = function(left) {
    dget('tleft').innerHTML = left;
  };

  self.setPlayerScore = function(last, total) {
    dget('lpscore').innerHTML = last;
    dget('pscore').innerHTML = '<b>' + total + '</b>';
  };

  self.setOpponentScore = function(last, total) {
    dget('loscore').innerHTML = last;
    dget('oscore').innerHTML = '<b>' + total + '</b>';
  };

  self.removefromPlayerRack = function(letters) {
    self.removeFromRack(1, letters);
  };

  self.removefromOpponenentRack = function(letters) {
    self.removeFromRack(2, letters);
  };

  self.setPlayerRack = function(letters) {
    self.setLetters(1, letters);
    if (self.firstrack) {
      self.firstrack = false;
      self.initRedips();
    }
  };

  self.setOpponentRack = function(letters) {
    self.setLetters(2, letters);
  };

  self.getPlayerRack = function() {
    return self.racks[1];
  };

  self.getOpponentRack = function() {
    return self.racks[2];
  };

  self.cancelPlayerPlacement = function() {
    var placement = self.getPlayerPlacement();
    var divs = [];
    var id;
    for (var i = 0; i < placement.length; ++i) {
      var pl = placement[i];
      id = self.boardId + pl.x + '_' + pl.y;
      var cell = dget(id);
      //if (cell.firstChild==null || typeof(cell.firstChild)=="undefined") alert("baaaaa");
      divs.push(cell.firstChild);
      cell.holds = '';
      cell.innerHTML = '';
    }
    var count = 0;
    for (var i = 0; i < self.racksize; ++i) {
      id = self.plrRackId + i;
      var rcell = dget(id);
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

  self.getPlayerPlacement = function() {
    var placement = [];
    var played = self.newplays;
    for (var l in played) {
      var sc = l.substr(1);
      var co = sc.split('_');
      var x = +co[0];
      var y = +co[1];
      var ltr = played[l].letter;
      var scr = played[l].points;
      placement.push({
        ltr: ltr,
        lsc: scr,
        x: x,
        y: y
      });
    }
    return placement;
  };

  self.acceptPlayerPlacement = function() {
    self.newplays = {};
    self.makeTilesFixed();
  };

  self.setLetters = function(player, letters) {
    self.racks[player] = letters;
    var cells = [];
    var t;

    // TODO: sanity checks on values of player

    var ifprfx = (player === 1) ? self.plrRackId : self.oppRackId;
    //var upper = letters.toUpperCase();
    var upper = '';
    for (var i = 0; i < letters.length; ++i) {
      upper += letters.charAt(i).toUpperCase();
    }

    for (var i = 0; i < self.racksize; ++i) {
      var id = ifprfx + i;
      var rcell = dget(id);
      // Remove the existing drag div?
      if (rcell.firstChild) rcell.removeChild(rcell.firstChild);
      var ltr = i < letters.length ? letters.charAt(i) : '';
      if (ltr !== '') {
        cells.push(rcell);
        var html = '<div class="drag t' + player + '">';
        var ltscr = self.scores[ltr];
        var holds = {
          letter: ltr,
          points: ltscr
        };
        rcell.holds = holds;
        if (ltr !== '*') {
          html += upper.charAt(i) + '<sup><font size="-3">';
          html += self.scores[ltr] + '</font></sup>';
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
      //if (player==2) self.rd.enableDrag( false, div );
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
        var obj = dget(id);
        obj.style.backgroundColor = self.cellbg;
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
      board: board,
      boardp: boardp,
      boardm: self.boardm
    };
  };

  self.prompt = function(msg, button) {
    var html = msg + '<br><center>';
    html += button || '<span class="button" onclick="hidePopWin()">' + t('OK') + '</span>';
    html += '</center>';
    showPopWin(html);
  };
}

var g_bui = new RedipsUI();

// for Closure compiler:
//-----------------------------
// evals in strings:
