import './App.css';
import React, { useState } from 'react';
import PublicMap from './PublicMap';
import pin from './icons/pin.svg'
import satellite from './img/satellite.png'
import terrain from './img/terrain.png'
import watercolor from './img/watercolor.png'

function App() {

  const [currentLayer, setCurrentLayer] = useState('satellite')

  return (
    <div className="App">

      <div className="header">
        <div className="title">
          <h1>Pin the city&nbsp;</h1> <img src={pin} alt="React Logo" width='20px' />
        </div>

        <div className="edit-buttons">
          {currentLayer != 'satellite' &&
            <div className="map-edit" onClick={() => setCurrentLayer('satellite')}>
              <img src={satellite} alt="satellite map" width='60px' />
              <caption>Map Terrain</caption>
            </div>
          }
          {currentLayer != 'terrain' &&
            <div className="map-edit" onClick={() => setCurrentLayer('terrain')}>
              <img src={terrain} alt="terrain map" width='60px' />
              <caption>Map Terrain</caption>
            </div>
          }
          {currentLayer != 'watercolor' &&
            <div className="map-edit" onClick={() => setCurrentLayer('watercolor')}>
              <img src={watercolor} alt="watercolor map" width='60px' />
              <caption>Map Dessiné</caption>
            </div>
          }
        </div>

      </div>


      <div className="box">
        <PublicMap layer={currentLayer} />
      </div>
    </div>
  );
}

export default App;
