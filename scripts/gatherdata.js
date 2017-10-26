import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const INPUT_DATA_DIR = '$HOME/Dropbox/TA6/Chapters';
const OUTPUT_DATA_DIR = './public/data';

const FILES = {
  '8 Deaths/TA6 Deaths Inset 1-Death by WHO region.xlsx': '8-1.csv',
  '8 Deaths/TA6 Deaths Inset 2-Cancer deaths in USA.xlsx': '8-2.csv',
  '8 Deaths/TA6 Deaths Inset 3-Attributable Deaths by Region.xlsx': '8-3.csv',
  '8 Deaths/TA6 Deaths Inset 4-Lung cancer & SES.xlsx': '8-4.csv',
  '8 Deaths/TA6 Deaths Map & Symbol.xlsx': '8-map.csv',
};

const execPromise = promisify(exec);

(async () => {
  await Promise.all(Object.keys(FILES).map(k => {
    const inFile = path.join(INPUT_DATA_DIR, k);
    const outFile = path.join(OUTPUT_DATA_DIR, FILES[k]);
    return execPromise(`in2csv "${inFile}" > "${outFile}"`);
  }));
})();
