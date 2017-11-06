import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const INPUT_DATA_DIR = '$HOME/Dropbox/TA6/Chapters';
const OUTPUT_DATA_DIR = './public/data';

const FILES = {
  '1 Growing/TA6 Growing Map - Print - 2014 Production by Tonne.xlsx': '1-map.csv',
  '1 Growing/TA6 Growing - Inset 1 - Production by HDI group.xlsx': '1-1.csv',
  '1 Growing/TA6 Growing - Inset 3 - Farmer profits - 5-country.xlsx': '1-3.csv',
  '1 Growing/TA6 Growing - Inset 4 - Sales of other crops.xlsx': '1-4.csv',
  '2 Manufacturing/TA6 Manufacturing Data-Main Map Largest Factories.xlsx': '2-map.csv',
  '2 Manufacturing/TA6 Manufacturing Data-Insert 4 - Factory Consolidation.xlsx': '2-4.csv',
  '3 Marketing/TA6 Marketing Data - Map.xlsx': '3-map.csv',
  '3 Marketing/TA6 Marketing Data - Insert 1.xlsx': '3-1.csv',
  '4 Prevalence/TA6 Prevalence Inset 1_Distribution of smokers by HDI.xlsx': '4-1.csv',
  '4 Prevalence/TA6 Prevalence Inset 2_Trend.xlsx': '4-2.csv',
  '4 Prevalence/TA6 Prevalence Inset 3-Monitoring.xlsx': '4-3.csv',
  '4 Prevalence/TA6 Prevalence Inset 4-Consumption.xlsx': '4-4.csv',
  '4 Prevalence/TA6 Prevalence Map & Symbol.xlsx': '4-map.csv',
  '5 Secondhand/TA6 Secondhand Inset 2-SHS in select countries.xlsx': '5-2.csv',
  '5 Secondhand/TA6 Secondhand Inset 3-SHS in Europe.xlsx': '5-3.csv',
  '5 Secondhand/TA6 Secondhand Inset 4-SHS by socioeconomic status.xlsx': '5-4.csv',
  '8 Deaths/TA6 Deaths Inset 1-Death by WHO region.xlsx': '8-1.csv',
  '8 Deaths/TA6 Deaths Inset 2-Cancer deaths in USA.xlsx': '8-2.csv',
  '8 Deaths/TA6 Deaths Inset 3-Attributable Deaths by Region.xlsx': '8-3.csv',
  '8 Deaths/TA6 Deaths Inset 4-Lung cancer & SES.xlsx': '8-4.csv',
  '8 Deaths/TA6 Deaths Map & Symbol.xlsx': '8-map.csv',
  '9 Societal Harms/TA6 Societal Inset1.xlsx': '9-1.csv',
  '9 Societal Harms/TA6 Societal Inset2 Jamaica.xlsx': '9-2.csv',
  '9 Societal Harms/TA6 Societal Inset3.xlsx': '9-3.csv',
  '9 Societal Harms/TA6 Societal Map.xlsx': '9-map.csv',
};

const execPromise = promisify(exec);

(async () => {
  await Promise.all(Object.keys(FILES).map(k => {
    const inFile = path.join(INPUT_DATA_DIR, k);
    const outFile = path.join(OUTPUT_DATA_DIR, FILES[k]);
    return execPromise(`in2csv "${inFile}" > "${outFile}"`);
  }));
})();