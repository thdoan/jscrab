const VER = '1.22';

function showWhatsNew() {
  g_bui.prompt(
    '<h3>What\'s New</h3>' +
    '<ul>' +
    '<li>Game sessions are automatically saved</li>' +
    '<li>Fixed Player Pass/Swap event overcounting</li>' +
    '<li>Fixed ability to change level while playing</li>' +
    '<li>Increased AI randomness to be more human-like</li>' +
    '<li>Added support for compound stem definitions</li>' +
    '<li>Fixed letter picker not shown after moving Blank tile</li>' +
    '</ul>'
  );
}

document.addEventListener('appReady', function() {
  if (VER > localStorage['ver'] || !localStorage['ver']) {
    showWhatsNew();
    localStorage['ver'] = VER;
  }
});