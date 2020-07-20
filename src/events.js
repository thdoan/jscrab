/**
 * EVENTS
 */

// Close the modal properly
function closeModal() {
  var elButton = g_cache['modalContent'].querySelector('.button');
  if (elButton) elButton.click();
  else hideModal();
}

// Handle modal interactions
function handleHideModal(e) {
  if (e.target && e.target.id === 'modal-inner') closeModal();
}

// Handle focus trap
function handleTrapFocus() {
  var elControl = g_cache['modalContent'].querySelector('input, button');
  if (elControl) elControl.focus();
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
    'app': dget('app'),
    'modalMask': dget('modal-mask'),
    'modalContainer': dget('modal-container'),
    'modalInner': dget('modal-inner'),
    'modalContent': dget('modal-content'),
    'sound': dget('sound')
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
    // Trap focus (https://css-tricks.com/a-css-approach-to-trap-focus-inside-of-an-element/)
    g_cache['modalContainer'].addEventListener('transitionend', handleTrapFocus);
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
    // Return a random integer between nMin and nMax (inclusive)
    var randInt = function(nMin, nMax) {
      return Math.floor(Math.random() * (nMax - nMin + 1) + nMin);
    };
    g_cache['app'].innerHTML = '<p><strong>' + aEmojis[randInt(0, aEmojis.length - 1)] + '</strong><br><br>' +
      t('Sorry, this browser is not supported. Please upgrade to a modern browser.') + '</p>';
    // GA
    gtag('event', navigator.userAgent, {
      'event_category': 'Unsupported Browser'
    });
  }
  // Fade in
  document.documentElement.classList.replace('loading', 'loaded');
});
