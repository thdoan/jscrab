const VER = '1.28';

function showWhatsNew() {
  g_bui.prompt(
    '<h3>What\'s New</h3>' +
    '<ul>' +
    '<li>Added restart button</li>' +
    '<li>Replaced top button text with icon</li>' +
    '<li>Fixed not being able to change bonuses layout</li>' +
    '</ul>'
  );
}

document.addEventListener('appReady', function() {
  if (VER > localStorage['ver'] || !localStorage['ver']) {
    showWhatsNew();
    localStorage['ver'] = VER;
  }
});