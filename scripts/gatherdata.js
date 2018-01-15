import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const INPUT_DATA_DIR = '$HOME/Dropbox/TA6/Chapters';
const OUTPUT_DATA_DIR = './public/data';

const FILES = {
  '1 Growing/TA6 Growing Map - Print - 2014 Production by Tonne.xlsx': '1-map.csv',
  '1 Growing/TA6 Growing - Inset 1 - Production by HDI group - data for the graph in the printed version.xlsx': '1-1.csv',
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
  '4 Prevalence/TA6 Prevalence Online Inset-Countries with highest no of smokers.xlsx': '4-5.csv',
  '4 Prevalence/TA6 Prevalence Map & Symbol.xlsx': '4-map.csv',
  '5 Secondhand/TA6 Secondhand Inset 2-SHS in select countries.xlsx': '5-2.csv',
  '5 Secondhand/TA6 Secondhand Inset 3-SHS in Europe.xlsx': '5-3.csv',
  '5 Secondhand/TA6 Secondhand Inset 4-SHS by socioeconomic status.xlsx': '5-4.csv',
  '6 Health/DALYs from tobacco.xlsx': '6-map.csv',
  '6 Health/Inset 1 Formatted.xlsx': '6-1.csv',
  '7 Comorbidities/Map - Comorbidities - TB deaths due to tobacco.xlsx': '7-map.csv',
  '7 Comorbidities/inset1-data-ESTIMATES.xlsx': '7-1.csv',
  '7 Comorbidities/inset3-data-ESTIMATES.xlsx': '7-3.csv',
  '8 Deaths/TA6 Deaths Inset 1-Death by WHO region.xlsx': '8-1.csv',
  '8 Deaths/TA6 Deaths Inset 2-Cancer deaths in USA.xlsx': '8-2.csv',
  '8 Deaths/TA6 Deaths Inset 3-Attributable Deaths by Region.xlsx': '8-3.csv',
  '8 Deaths/TA6 Deaths Inset 4-Lung cancer & SES.xlsx': '8-4.csv',
  '8 Deaths/TA6 Deaths Map & Symbol.xlsx': '8-map.csv',
  '9 Societal Harms/TA6 Societal Inset1.xlsx': '9-1.csv',
  '9 Societal Harms/TA6 Societal Inset2 Jamaica.xlsx': '9-2.csv',
  '9 Societal Harms/TA6 Societal Inset3.xlsx': '9-3.csv',
  '9 Societal Harms/TA6 Societal Map.xlsx': '9-map.csv',
  '10 Global Strategy/TA6 Strategy MAP Map 2017.xlsx': '10-map.csv',
  '10 Global Strategy/TA6 Strategy Inset 1.xlsx': '10-1.csv',
  '10 Global Strategy/TA6 Strategy Inset 3_HDI classification.xlsx': '10-3.csv',
  '11 Quitting/TA6 Quitting Map.xlsx': '11-map.csv',
  '11 Quitting/TA6 Quitting Inset 2 Smokers want to quit_2017.xlsx': '11-2.csv',
  '11 Quitting/TA6 Quitting Inset 3 Risk of Lung Cancer Declines After Quitting.csv': '11-3.csv',
  '12 Taxes/TA6 Tax Map.xlsx': '12-map.csv',
  '12 Taxes/TA6 Tax Inset 2 tax is powerful.xlsx': '12-2.csv',
  '12 Taxes/TA6 Tax Inset 3 substitution.xlsx': '12-3.csv',
  '12 Taxes/TA6 Tax Inset 4 tax and illicit.xlsx': '12-4.csv',
  '13 Smokefree/High achieving smoke-free countries.xlsx': '13-map.csv',
  '13 Smokefree/Smokefree inset 1.xlsx': '13-1.csv',
  '14 Media/TA6 Media Map.xlsx': '14-map.csv',
  '15 Partnerships/TA6 Map_Partnerships.xlsx': '15-map.csv',
  '16 ENDS/TA6 ENDS Map (Market Access).xlsx': '16-map.csv',
  '18 Countering the Industry/Map - Countering the Industry - Country litigation.xlsx': '18-map.csv',
  '19 Optimism/TA6 Optimism Map.xlsx': '19-map.csv',
  'Web Smokeless/TA6 Smokeless Data.xlsx': 'smokeless-map.csv',
  'Web Waterpipe/TA6 Waterpipe Data Inset 1.xlsx': 'waterpipe-1.csv',
  'Web Waterpipe/TA6 Waterpipe Data Inset 2.xlsx': 'waterpipe-2.csv',
  'Web Waterpipe/TA6 Waterpipe Data Inset 3.xlsx': 'waterpipe-3.csv',
};

const execPromise = promisify(exec);

(async () => {
  await Promise.all(Object.keys(FILES).map(k => {
    const inFile = path.join(INPUT_DATA_DIR, k);
    const outFile = path.join(OUTPUT_DATA_DIR, FILES[k]);
    return execPromise(`in2csv "${inFile}" > "${outFile}"`);
  }));
})();
