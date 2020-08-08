/**
 * EVENTS
 */

// Animate icon
function animateIcon(elIcon) {
  var nTick = 0;
  var nTimer = setInterval(function() {
    elIcon.style.filter = 'brightness(' + randFloat(0.85, 1, 2) + ') hue-rotate(' + randInt(0, 360) + 'deg)';
    if (++nTick === 20) clearInterval(nTimer);
  }, 100);
}

// Close the modal properly
function closeModal() {
  if (el('swaptable')) {
    g_bui.onSwap(true);
  } else {
    var elButton = g_cache['modalContent'].querySelector('.button');
    if (elButton) elButton.click();
    else hideModal();
  }
}

// Handle modal interactions
function handleHideModal(e) {
  if (e.target && e.target.id === 'modal-inner') closeModal();
}

// Handle keyboard shortcuts
function handleKeyDown(e) {
  // Close modal on Escape
  if (e.key === 'Escape') closeModal();
}

document.addEventListener('keydown', handleKeyDown);

window.addEventListener('load', function() {
  // Cache elements
  g_cache = {
    'app': el('app'),
    'modalMask': el('modal-mask'),
    'modalContainer': el('modal-container'),
    'modalInner': el('modal-inner'),
    'modalContent': el('modal-content'),
    'sound': el('sound')
  };
  // Check browser support
  if (Array.prototype.indexOf
    && document.querySelector
    && window.addEventListener
    && window.console
    && window.DOMTokenList
    && window.JSON
    && window.localStorage) {
    init('board');
    // Close modal by clicking on its shadow
    g_cache['modalMask'].addEventListener('click', closeModal);
    g_cache['modalInner'].addEventListener('click', handleHideModal);
  } else {
    // Sad faces to randomly show
    var aEmojis = [
      '&#9785;',   // Frowning
      '&#128530;', // Unamused
      '&#128546;', // Crying
      '&#128528;', // Neutral
      '&#128527;', // Smirking
      '&#128529;', // Expressionless
      '&#128532;', // Pensive
      '&#128533;', // Confused
      '&#128542;', // Disappointed
      '&#128543;', // Worried
      '&#128550;', // Frowning with open mouth
      '&#128551;'  // Anguished
    ];
    g_cache['app'].innerHTML = '<p><strong>' + aEmojis[randInt(0, aEmojis.length - 1)] + '</strong><br><br><br>' +
      t('Sorry, this browser is not supported. Please upgrade to a modern browser.') + '</p>';
    // GA
    gtag('event', navigator.userAgent, {
      'event_category': 'Unsupported Browser'
    });
  }
  // Fade in
  document.documentElement.classList.replace('loading', 'loaded');
});