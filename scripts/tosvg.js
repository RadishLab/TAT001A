import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { promisify } from 'util';

const OUTPUT_DIR = './output';
const URL = 'http://localhost:3000';

// Use puppeteer to load the page of visualizations, grab all the SVG elements,
// and save them to their own individual files. File names are assigned by
// element id.
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });

  const svgs = await page.evaluate(() => {
    const svgElements = Array.from(document.querySelectorAll('svg'));
    return svgElements.map(element => {
      // Cribbed from https://github.com/lukehorvat/computed-style-to-inline-style
      const computedStyleToInlineStyle = (element) => {
        Array.prototype.forEach.call(element.children, function(child) {
          computedStyleToInlineStyle(child);
        });

        var computedStyle = getComputedStyle(element, null);
        for (var i = 0; i < computedStyle.length; i++) {
          var property = computedStyle.item(i);
          var value = computedStyle.getPropertyValue(property);
          element.style[property] = value;
        }
      }

      computedStyleToInlineStyle(element);
      return { id: element.id, content: element.outerHTML }
    });
  });

  const writeSvg = promisify(fs.writeFile);

  await Promise.all(svgs.map((svg) => writeSvg(path.join(OUTPUT_DIR, `${svg.id}.svg`), svg.content)));

  await browser.close();
})();
