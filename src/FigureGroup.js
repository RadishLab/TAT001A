import React from 'react';

import Figure from './Figure';

export default function FigureGroup({ title, chapter, figures }) {
  return (
    <section>
      <h1>{title}</h1>
      {figures.map(figure => {
        let renderedFigure;
        if (figure.type === 'map') {
          renderedFigure = (
            <div key={figure.name}>
              <Figure id={`${chapter}-${figure.name}`} figureClass={figure.figureClass} size='map'/>
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
