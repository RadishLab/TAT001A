import CSV from 'comma-separated-values';
import React, { Component } from 'react';
import i18next from 'i18next';

import FigureGroup from './FigureGroup';
import { figures as ch1Figures } from './chapters/ch1/Figures';
import { figures as ch2Figures } from './chapters/ch2/Figures';
import { figures as ch3Figures } from './chapters/ch3/Figures';
import { figures as ch4Figures } from './chapters/ch4/Figures';
import { figures as ch5Figures } from './chapters/ch5/Figures';
import { figures as ch6Figures } from './chapters/ch6/Figures';
import { figures as ch7Figures } from './chapters/ch7/Figures';
import { figures as ch8Figures } from './chapters/ch8/Figures';
import { figures as ch9Figures } from './chapters/ch9/Figures';
import { figures as ch10Figures } from './chapters/ch10/Figures';
import { figures as ch11Figures } from './chapters/ch11/Figures';
import { figures as ch12Figures } from './chapters/ch12/Figures';
import { figures as ch13Figures } from './chapters/ch13/Figures';
import { figures as ch14Figures } from './chapters/ch14/Figures';
import { figures as ch15Figures } from './chapters/ch15/Figures';
import { figures as ch16Figures } from './chapters/ch16/Figures';
import { figures as ch18Figures } from './chapters/ch18/Figures';
import { figures as ch19Figures } from './chapters/ch19/Figures';
import { figures as consumptionFigures } from './chapters/consumption/Figures';
import { figures as smokelessFigures } from './chapters/smokeless/Figures';
import { figures as waterpipeFigures } from './chapters/waterpipe/Figures';
import { figures as youthFigures } from './chapters/youth/Figures';

class App extends Component {
  constructor() {
    super();
    this.missingKeys = {};
    i18next.init({
      lng: 'en',
      fallbackLng: 'en',
      debug: true,
      saveMissing: true,
      missingKeyHandler: (lng, ns, key, fallbackValue) => {
        if (!key || key === '') return;
        if (!this.missingKeys[lng]) {
          this.missingKeys[lng] = new Set();
        }
        this.missingKeys[lng].add(key);
      },
      resources: {
        en: {
          translation: {}
        }
      }
    });
  }

  render() {
    return (
      <div>
        <button style={{ float: 'right' }} onClick={() => {
          const data = Array.from(this.missingKeys.en).map(key => {
            return key.split('.', 2);
          }).sort((a, b) => {
            const aChapter = parseInt(a[0].split('-')[0], 10);
            const bChapter = parseInt(b[0].split('-')[0], 10);
            if (aChapter !== bChapter) return aChapter - bChapter;
            return a[0].localeCompare(b[0]);
          });
          const link = document.createElement('a');
          console.log(data);
          link.setAttribute('href', encodeURI('data:text/csv;charset=utf-8,' + new CSV(data, {
            header: ['figure', 'english', 'chinese', 'spanish', 'arabic', 'portuguese']
          }).encode()));
          link.setAttribute('download', 'missing-keys.csv');
          link.click();
        }}>
          get missing
        </button>
        <FigureGroup title='Chapter 1' chapter={1} figures={ch1Figures}/>
        <FigureGroup title='Chapter 2' chapter={2} figures={ch2Figures}/>
        <FigureGroup title='Chapter 3' chapter={3} figures={ch3Figures}/>
        <FigureGroup title='Chapter 4' chapter={4} figures={ch4Figures}/>
        <FigureGroup title='Chapter 5' chapter={5} figures={ch5Figures}/>
        <FigureGroup title='Chapter 6' chapter={6} figures={ch6Figures}/>
        <FigureGroup title='Chapter 7' chapter={7} figures={ch7Figures}/>
        <FigureGroup title='Chapter 8' chapter={8} figures={ch8Figures}/>
        <FigureGroup title='Chapter 9' chapter={9} figures={ch9Figures}/>
        <FigureGroup title='Chapter 10' chapter={10} figures={ch10Figures}/>
        <FigureGroup title='Chapter 11' chapter={11} figures={ch11Figures}/>
        <FigureGroup title='Chapter 12' chapter={12} figures={ch12Figures}/>
        <FigureGroup title='Chapter 13' chapter={13} figures={ch13Figures}/>
        <FigureGroup title='Chapter 14' chapter={14} figures={ch14Figures}/>
        <FigureGroup title='Chapter 15' chapter={15} figures={ch15Figures}/>
        <FigureGroup title='Chapter 16' chapter={16} figures={ch16Figures}/>
        <FigureGroup title='Chapter 18' chapter={18} figures={ch18Figures}/>
        <FigureGroup title='Chapter 19' chapter={19} figures={ch19Figures}/>
        <FigureGroup title='Consumption' chapter={'consumption'} figures={consumptionFigures}/>
        <FigureGroup title='Smokeless' chapter={'smokeless'} figures={smokelessFigures}/>
        <FigureGroup title='Waterpipe' chapter={'waterpipe'} figures={waterpipeFigures}/>
        <FigureGroup title='Youth' chapter={'youth'} figures={youthFigures}/>
      </div>
    );
  }
}

export default App;
