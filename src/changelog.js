const VER = 1.02;

function showWhatsNew() {
  g_bui.prompt(
    '<h3>What\'s New</h3>' +
    '<ul>' +
    '<li>Option to change bonuses layout</li>' +
    '<li>Update notfication (what you\'re seeing now)</li>' +
    '<li>New "Game Over" experience</li>' +
    '<li>Replaced email with Facebook Page</li>' +
    '</ul>'
  );
}

document.addEventListener('appReady', function() {
  if (VER > localStorage['ver'] || !localStorage['ver']) {
    showWhatsNew();
    localStorage['ver'] = VER;
  }
});