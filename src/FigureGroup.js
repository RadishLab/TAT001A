import React from 'react';

import Figure from './Figure';

export default function FigureGroup({ title, chapter, figures }) {
  return (
    <section>
      <h1>{title}</h1>
      {figures.map(figure => {
        let renderedFigure;
        if (figure.dimensions) {
          renderedFigure = (
            <div key={figure.name}>
              <Figure id={`${chapter}-${figure.name}`} figureClass={figure.figureClass} dimensions={figure.dimensions} />
            </div>
          );
        } else if (figure.type === 'map') {
          let size = 'map';
          if (figure.area === 'Europe') {
            size = 'map-europe';
          }
          renderedFigure = (
            <div key={figure.name}>
              <Figure id={`${chapter}-${figure.name}`} figureClass={figure.figureClass} size={size} />
            </div>
          );
        } else if (figure.type === 'chart-vertical') {
          renderedFigure = (
            <div key={figure.name}>
              <Figure id={`${chapter}-${figure.name}`} figureClass={figure.figureClass} size='chart-vertical' />
            </div>
          );
        } else {
          renderedFigure = (
            <div key={figure.name}>
              <Figure id={`${chapter}-${figure.name}-wide`} figureClass={figure.figureClass} size='wide'/>
              <Figure id={`${chapter}-${figure.name}-narrow`} figureClass={figure.figureClass} size='narrow'/>
            </div>
          );
        }
        return renderedFigure;
      })}
    </section>
  );
}
