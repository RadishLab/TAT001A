import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

/*
 * Index for React app that shows all of the visualizations on one page. Mostly
 * useful for development.
 */
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
