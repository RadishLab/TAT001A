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
import { figures as ch15figures } from './ch15/Figures.js';
import { figures as ch16figures } from './ch16/Figures.js';
import { figures as ch18figures } from './ch18/Figures.js';
import { figures as ch19figures } from './ch19/Figures.js';
import { figures as consumptionFigures } from './consumption/Figures.js';
import { figures as smokelessFigures } from './smokeless/Figures.js';
import { figures as waterpipeFigures } from './waterpipe/Figures.js';
import { figures as youthFigures } from './youth/Figures.js';

/*
 * Gather all figures for all chapters here in one exportable object that we can
 * loop over later.
 */

const chapters = {
  'ch1': ch1figures,
  'ch2': ch2figures,
  'ch3': ch3figures,
  'ch4': ch4figures,
  'ch5': ch5figures,
  'ch6': ch6figures,
  'ch7': ch7figures,
  'ch8': ch8figures,
  'ch9': ch9figures,
  'ch10': ch10figures,
  'ch11': ch11figures,
  'ch12': ch12figures,
  'ch13': ch13figures,
  'ch14': ch14figures,
  'ch15': ch15figures,
  'ch16': ch16figures,
  'ch18': ch18figures,
  'ch19': ch19figures,
  'consumption': consumptionFigures,
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
