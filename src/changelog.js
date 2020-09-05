const VER = '1.15';

function showWhatsNew() {
  g_bui.prompt(
    '<h3>What\'s New</h3>' +
    '<ul>' +
    '<li>You can now play part of a compound word</li>' +
    '<li>Increased space tile value from 1 to 10 points</li>' +
    '</ul>'
  );
}

document.addEventListener('appReady', function() {
  if (VER > localStorage['ver'] || !localStorage['ver']) {
    showWhatsNew();
    localStorage['ver'] = VER;
  }
});