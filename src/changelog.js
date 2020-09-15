const VER = '1.25';

function showWhatsNew() {
  g_bui.prompt(
    '<h3>What\'s New</h3>' +
    '<ul>' +
    '<li>Fixed mobile scoreboard not updated on game over</li>' +
    '<li>Now showing player score first</li>' +
    '<li>Fixed session not saved if computer passes</li>' +
    '</ul>'
  );
}

document.addEventListener('appReady', function() {
  if (VER > localStorage['ver'] || !localStorage['ver']) {
    showWhatsNew();
    localStorage['ver'] = VER;
  }
});