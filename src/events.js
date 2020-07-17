/**
 * EVENTS
 */

// Close the modal properly
function closeModal() {
  var button = dget('#popupContent span.button');
  if (button) button.click();
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
  if (!document.querySelectorAll) document.querySelectorAll = Sizzle;
  init('idBoard');
  // Close modal by clicking on its shadow
  dget('popupInner').addEventListener('click', handleHidePopWin);
});
