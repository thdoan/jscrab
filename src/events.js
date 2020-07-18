/**
 * EVENTS
 */

// Close the modal properly
function closeModal() {
  var elButton = dget('#popupContent span.button');
  if (elButton) elButton.click();
  else hidePopWin();
}

// Handle modal interactions
function handleHidePopWin(e) {
  if (e.target && e.target.id === 'popupInner') closeModal();
}

// Handle keyboard shortcuts
function handleKeyDown(e) {
  // Close modal on Escape
  if (e.key === 'Escape') closeModal();
}

// Handle user selection
function handleSelectStart() {
  return false;
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('selectstart', handleSelectStart);

window.addEventListener('load', function() {
  // Check browser support
  if (document.querySelector && window.console && window.DOMTokenList && window.JSON) {
    init('idBoard');
    // Close modal by clicking on its shadow
    dget('popupInner').addEventListener('click', handleHidePopWin);
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
      return Math.floor(Math.random()*(nMax-nMin+1)+nMin);
    };
    dget('uidiv').innerHTML = '<strong>' + aEmojis[randInt(0, aEmojis.length-1)] + '</strong><br><br>' +
      t('Sorry, this browser is not supported. Please upgrade to a modern browser.');
  }
  // Fade in
  document.documentElement.classList.replace('loading', 'loaded');
});
