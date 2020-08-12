// [letter (* is Blank/joker), points for letter, number of tiles]
var g_letters = [
  ['a', 1, 6],
  ['á', 1, 1],
  ['à', 1, 1],
  ['ã', 1, 1],
  ['ạ', 1, 1],
  ['ả', 1, 1],
  ['ă', 1, 1],
  ['ắ', 1, 1],
  ['ằ', 1, 1],
  ['ẳ', 1, 1],
  ['ặ', 1, 1],
  ['ẵ', 1, 1],
  ['â', 1, 1],
  ['ấ', 1, 1],
  ['ầ', 1, 1],
  ['ẩ', 1, 1],
  ['ậ', 1, 1],
  ['ẫ', 1, 1],
  ['b', 4, 5],
  ['c', 2, 7],
  ['d', 4, 5],
  ['đ', 4, 5],
  ['e', 1, 6],
  ['é', 1, 1],
  ['è', 1, 1],
  ['ẻ', 1, 1],
  ['ẹ', 1, 1],
  ['ẽ', 1, 1],
  ['ê', 1, 1],
  ['ế', 1, 1],
  ['ề', 1, 1],
  ['ể', 1, 1],
  ['ệ', 1, 1],
  ['ễ', 1, 1],
  ['g', 2, 7],
  ['h', 1, 14],
  ['i', 1, 6],
  ['í', 1, 1],
  ['ì', 1, 1],
  ['ĩ', 1, 1],
  ['ỉ', 1, 1],
  ['ị', 1, 1],
  ['k', 5, 4],
  ['l', 4, 5],
  ['m', 2, 7],
  ['n', 1, 20],
  ['o', 1, 6],
  ['ó', 1, 1],
  ['ò', 1, 1],
  ['ỏ', 1, 1],
  ['ọ', 1, 1],
  ['õ', 1, 1],
  ['ô', 1, 1],
  ['ố', 1, 1],
  ['ồ', 1, 1],
  ['ổ', 1, 1],
  ['ộ', 1, 1],
  ['ỗ', 1, 1],
  ['ơ', 1, 1],
  ['ớ', 1, 1],
  ['ờ', 1, 1],
  ['ở', 1, 1],
  ['ợ', 1, 1],
  ['ỡ', 1, 1],
  ['p', 5, 3],
  ['q', 10, 2],
  ['r', 5, 3],
  ['s', 8, 2],
  ['t', 1, 13],
  ['u', 1, 6],
  ['ú', 1, 1],
  ['ù', 1, 1],
  ['ủ', 1, 1],
  ['ụ', 1, 1],
  ['ũ', 1, 1],
  ['ư', 1, 1],
  ['ứ', 1, 1],
  ['ừ', 1, 1],
  ['ử', 1, 1],
  ['ự', 1, 1],
  ['ữ', 1, 1],
  ['v', 10, 2],
  ['x', 8, 2],
  ['y', 8, 2],
  ['ý', 1, 1],
  ['ỳ', 1, 1],
  ['ỹ', 1, 1],
  ['ỷ', 1, 1],
  ['ỵ', 1, 1],
  [' ', 1, 6],
  ['*', 0, 6]
];

var g_letrange = '[abcdeghiklmnopqrstuvxyáàâăãấầắằẫẵảẩẳạậặđéèêẽếềễẻểẹệíìĩỉịóòôõốồỗỏơổọớờỡộởợúùũưụứừữửựủýỳỹỷỵ ]';