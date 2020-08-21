const VER = 1.05;

function showWhatsNew() {
  g_bui.prompt(
    '<h3>What\'s New</h3>' +
    '<ul>' +
    '<li>Fixed possibility to swap more tiles than what\'s remaining in the bag</li>' +
    '<li>Changed position of Pass button to avoid accidentally passing when you meant to press Play</li>' +
    '<li>Added shuffle feature (when a tile is placed on the board, the Shuffle button changes to Clear)</li>' +
    '</ul>'
  );
}

document.addEventListener('appReady', function() {
  if (VER > localStorage['ver'] || !localStorage['ver']) {
    showWhatsNew();
    localStorage['ver'] = VER;
  }
});