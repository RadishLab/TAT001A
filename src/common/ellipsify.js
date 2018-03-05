/*
 * Chop off text and add an ellipsis if it's too long.
 *
 * Mostly useful in situations like y labels which tend to be on the long side.
 */
export default function ellipsify(selection, width, padding = 1) {
  let textLength = selection.node().getComputedTextLength(),
    text = selection.text();
  while (textLength > (width - 2 * padding) && text.length > 0) {
    text = text.slice(0, -1);
    selection.text(text + '\u2026');
    textLength = selection.node().getComputedTextLength();
  }
} 
