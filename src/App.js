import React, { Component } from 'react';

import FigureGroup from './FigureGroup';
import { figures as ch1Figures } from './chapters/ch1/Figures';
import { figures as ch2Figures } from './chapters/ch2/Figures';
import { figures as ch4Figures } from './chapters/ch4/Figures';
import { figures as ch8Figures } from './chapters/ch8/Figures';
import { figures as ch9Figures } from './chapters/ch9/Figures';

class App extends Component {
  render() {
    return (
      <div>
        <FigureGroup title='Chapter 1' chapter={1} figures={ch1Figures}/>
        <FigureGroup title='Chapter 2' chapter={2} figures={ch2Figures}/>
        <FigureGroup title='Chapter 4' chapter={4} figures={ch4Figures}/>
        <FigureGroup title='Chapter 8' chapter={8} figures={ch8Figures}/>
        <FigureGroup title='Chapter 9' chapter={9} figures={ch9Figures}/>
      </div>
    );
  }
}

export default App;
