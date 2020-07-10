var translation_map = {
  ' is not connected to a word.': ' is not connected to a word.',
  ' not found in dictionary.': ' not found in dictionary.',
  'After deducting points of unplaced tiles, the score is...': 'After deducting points of unplaced tiles, the score is...',
  'Clear': 'Clear',
  'Computer last score:': 'Computer last score:',
  'Computer thinking, please wait...': 'Computer thinking, please wait...',
  'Computer total score:': 'Computer total score:',
  'Computer wins.': 'Computer wins.',
  'Computer: ': 'Computer: ',
  'Dictionary inconsistency.': 'Dictionary inconsistency.',
  'first word must be on the star.': 'first word must be on the star.',
  'Hide computer\'s rack': 'Hide computer\'s rack',
  'I pass, your turn.': 'I pass, your turn.',
  'It\'s a draw!': 'It\'s a draw!',
  'no letters were placed.': 'no letters were placed.',
  'OK': 'OK',
  'Pass': 'Pass',
  'Play': 'Play',
  'Playing at level:': 'Playing at level:',
  'Show computer\'s rack': 'Show computer\'s rack',
  'Sorry, ': 'Sorry, ',
  'Sorry, no tiles left to swap.': 'Sorry, no tiles left to swap.',
  'spaces in word.': 'spaces in word.',
  'Swap': 'Swap',
  'Tiles left:': 'Tiles left:',
  'Word definitions not enabled.': 'Word definitions not enabled.',
  'word must be horizontal or vertical.': 'word must be horizontal or vertical.',
  'Words played:': 'Words played:',
  'You win!': 'You win!',
  'You: ': 'You: ',
  'Your last score:': 'Your last score:',
  'Your total score:': 'Your total score:'
};

function t(str) {
  if (!(str in translation_map)) return str;
  return translation_map[str];
}
