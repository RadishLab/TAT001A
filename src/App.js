import React, { Component } from 'react';

import FigureGroup from './FigureGroup';
import { figures as ch1Figures } from './chapters/ch1/Figures';
import { figures as ch2Figures } from './chapters/ch2/Figures';
import { figures as ch3Figures } from './chapters/ch3/Figures';
import { figures as ch4Figures } from './chapters/ch4/Figures';
import { figures as ch5Figures } from './chapters/ch5/Figures';
import { figures as ch6Figures } from './chapters/ch6/Figures';
import { figures as ch8Figures } from './chapters/ch8/Figures';
import { figures as ch9Figures } from './chapters/ch9/Figures';
import { figures as ch10Figures } from './chapters/ch10/Figures';
import { figures as ch11Figures } from './chapters/ch11/Figures';
import { figures as ch12Figures } from './chapters/ch12/Figures';
import { figures as ch13Figures } from './chapters/ch13/Figures';
import { figures as ch15Figures } from './chapters/ch15/Figures';

class App extends Component {
  render() {
    return (
      <div>
        <FigureGroup title='Chapter 1' chapter={1} figures={ch1Figures}/>
        <FigureGroup title='Chapter 2' chapter={2} figures={ch2Figures}/>
        <FigureGroup title='Chapter 3' chapter={3} figures={ch3Figures}/>
        <FigureGroup title='Chapter 4' chapter={4} figures={ch4Figures}/>
        <FigureGroup title='Chapter 5' chapter={5} figures={ch5Figures}/>
        <FigureGroup title='Chapter 6' chapter={6} figures={ch6Figures}/>
        <FigureGroup title='Chapter 8' chapter={8} figures={ch8Figures}/>
        <FigureGroup title='Chapter 9' chapter={9} figures={ch9Figures}/>
        <FigureGroup title='Chapter 10' chapter={10} figures={ch10Figures}/>
        <FigureGroup title='Chapter 11' chapter={11} figures={ch11Figures}/>
        <FigureGroup title='Chapter 12' chapter={12} figures={ch12Figures}/>
        <FigureGroup title='Chapter 13' chapter={13} figures={ch13Figures}/>
        <FigureGroup title='Chapter 15' chapter={15} figures={ch15Figures}/>
      </div>
    );
  }
}

export default App;
