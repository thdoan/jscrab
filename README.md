# Ô Chữ Tiếng Việt - Vietnamese Scrabble(TM) type game in JavaScript

This is an implementation in pure JavaScript played against the computer with a very fast engine. To start the game, you can go directly to http://thdoan.github.io/o-chu-tieng-viet or download the code and open *index.html* in your browser.

The code comprises an engine (engine.js) that does the game logic and a user interface (ui.js) that implements a GUI to the game engine. This design allows one to easily create alternative user interfaces. The code is also designed to be easily localized to other languages and currently supports English, Russian, Spanish, and Vietnamese (default).

The fast game play is made possible by leveraging Regular Expressions to conduct searches. The current GUI makes use of the excellent [REDIPS.drag](https://github.com/dbunic/REDIPS_drag) drag-and-drop library. Other credits go to [Sizzle](https://github.com/jquery/sizzle) and [subModal](https://code.google.com/archive/p/submodal/).

Corrections and comments are welcome.

## Dependencies for local build

- [Microsoft Ajax Minifier](https://github.com/microsoft/ajaxmin)
- [Find And Replace Text](https://github.com/lionello/fart-it)