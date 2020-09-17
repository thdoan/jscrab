const VER = '1.29';

function showWhatsNew() {
  g_bui.prompt(
    '<h3>What\'s New</h3>' +
    '<ul>' +
    '<li>Added restart button</li>' +
    '<li>Replaced top button text with icon</li>' +
    '<li>Fixed not being able to change bonuses layout</li>' +
    '<li>Fixed game info left column width changes after first move</li>' +
    '</ul>'
  );
}

document.addEventListener('appReady', function() {
  if (VER > localStorage['ver'] || !localStorage['ver']) {
    showWhatsNew();
    localStorage['ver'] = VER;
  }
});