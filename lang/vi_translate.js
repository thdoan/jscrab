var translation_map = {};

function t(str) {
  if (!(str in translation_map)) return str;
  return translation_map[str];
}
