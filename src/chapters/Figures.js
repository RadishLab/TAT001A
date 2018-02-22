import { figures as ch1figures } from './ch1/Figures.js';
import { figures as ch2figures } from './ch2/Figures.js';
import { figures as ch3figures } from './ch3/Figures.js';
import { figures as ch4figures } from './ch4/Figures.js';
import { figures as ch5figures } from './ch5/Figures.js';
import { figures as ch6figures } from './ch6/Figures.js';
import { figures as ch7figures } from './ch7/Figures.js';
import { figures as ch8figures } from './ch8/Figures.js';
import { figures as ch9figures } from './ch9/Figures.js';
import { figures as ch10figures } from './ch10/Figures.js';
import { figures as ch11figures } from './ch11/Figures.js';
import { figures as ch12figures } from './ch12/Figures.js';
import { figures as ch13figures } from './ch13/Figures.js';
import { figures as ch14figures } from './ch14/Figures.js';
import { figures as ch15figures } from './ch15/Figures.js';
import { figures as ch16figures } from './ch16/Figures.js';
import { figures as ch18figures } from './ch18/Figures.js';
import { figures as ch19figures } from './ch19/Figures.js';
import { figures as consumptionFigures } from './consumption/Figures.js';
import { figures as environmentFigures } from './environment/Figures.js';
import { figures as illicitFigures } from './illicit/Figures.js';
import { figures as smokelessFigures } from './smokeless/Figures.js';
import { figures as waterpipeFigures } from './waterpipe/Figures.js';
import { figures as youthFigures } from './youth/Figures.js';

/*
 * Gather all figures for all chapters here in one exportable object that we can
 * loop over later.
 */

const chapters = {
  '1': ch1figures,
  '2': ch2figures,
  '3': ch3figures,
  '4': ch4figures,
  '5': ch5figures,
  '6': ch6figures,
  '7': ch7figures,
  '8': ch8figures,
  '9': ch9figures,
  '10': ch10figures,
  '11': ch11figures,
  '12': ch12figures,
  '13': ch13figures,
  '14': ch14figures,
  '15': ch15figures,
  '16': ch16figures,
  '18': ch18figures,
  '19': ch19figures,
  'consumption': consumptionFigures,
  'environment': environmentFigures,
  'illicit': illicitFigures,
  'smokeless': smokelessFigures,
  'waterpipe': waterpipeFigures,
  'youth': youthFigures,
};

const figures = {};

Object.entries(chapters).forEach(entry => {
  const [chapter, chapterFigures] = entry;
  chapterFigures.forEach(figure => {
    figures[`${chapter}-${figure.name}`] = figure;
  });
});

export default figures;
