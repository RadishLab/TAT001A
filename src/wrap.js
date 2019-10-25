import { select } from 'd3-selection';

export default function wrap(text, width, rtl = false) {
  text.each(function() {
    var text = select(this);
    var words = text.text() === 'Viet Nam' ?
      ['Viet Nam'] : text.text().split(/\s+/);
    if (!rtl) {
      words = words.reverse();
    }
    var word = words.pop();
    var line = [];
    var lineNumber = 0;
    var lineHeight = 1.1; // ems
    var y = text.attr('y');
    var dy = parseFloat(text.attr('dy'));
    var tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
    while (word) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width && line.length > 1) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
      }
      word = words.pop();
    }
  });
}
