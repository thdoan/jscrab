const VER = '1.11';

function showWhatsNew() {
  g_bui.prompt(
    '<h3>What\'s New</h3>' +
    '<ul>' +
    '<li>Fixed Vietnamese text wrapping on iPad</li>' +
    '<li>Added Flower Garden bonuses layout</li>' +
    '<li>Updated desktop logo to be consistent with mobile</li>' +
    '<li>Moved desktop logo to the left side</li>' +
    '<li>Added High Scores button (placeholder)</li>' +
    '<li>Added version number</li>' +
    '</ul>'
  );
}

document.addEventListener('appReady', function() {
  if (VER > localStorage['ver'] || !localStorage['ver']) {
    showWhatsNew();
    localStorage['ver'] = VER;
  }
});