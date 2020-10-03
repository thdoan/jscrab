const VER = '1.33';

function showWhatsNew() {
  g_bui.prompt(
    '<h3>What\'s New</h3>' +
    '<ul>' +
    '<li>Improved computer swapping logic</li>' +
    '<li>Randomness is now consistent across all levels</li>' +
    '<li>Fixed computer match pattern algorithm</li>' +
    '</ul>'
  );
}

document.addEventListener('appReady', function() {
  if (VER > localStorage['ver'] || !localStorage['ver']) {
    showWhatsNew();
    localStorage['ver'] = VER;
  }
});