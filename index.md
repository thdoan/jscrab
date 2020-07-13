This is a Vietnamese Scrabble-type game implemented in pure JavaScript and played against the computer with a very fast engine. You can [play the game online](http://thdoan.github.io/o-chu-tieng-viet/build/) or download the code and open *index.html* in your browser.

The code comprises an engine (*engine.js*) that does the game logic and a user interface (*ui.js*) that renders the board and manages user interactions. This design allows one to easily create alternative user interfaces. The code is also designed to be easily localized to other languages and currently supports English, Russian, Spanish, and Vietnamese (this version).

The fast game play is made possible by leveraging Regular Expressions to conduct searches. The current UI makes use of the excellent [REDIPS.drag](https://github.com/dbunic/REDIPS_drag) drag-and-drop library. Other credits go to [Sizzle](https://github.com/jquery/sizzle) for the CSS selector engine, [subModal](https://code.google.com/archive/p/submodal/) for the modal dialogs, and [VDict](https://vdict.com/) for the word definitions.

Corrections and comments are welcome by [creating an Issue](https://github.com/thdoan/vietboard/issues).

## Dependencies for local build

- [Microsoft Ajax Minifier](https://github.com/microsoft/ajaxmin)
- [Find And Replace Text](https://github.com/lionello/fart-it)