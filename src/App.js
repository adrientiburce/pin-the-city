import './App.css';
import React, { useEffect, useState } from 'react';
import PublicMap from './PublicMap';
import pin from './icons/pin.svg'
import satellite from './img/satellite.png'
import terrain from './img/terrain.png'
import watercolor from './img/watercolor.png'
import prefectures from './data/prefectures.json'
import Utils from './utils.js'
import { preventDefault } from 'ol/events/Event';




function randomCities(citiesTotal) {
  let keyArray = Object.keys(prefectures);
  keyArray = Utils.shuffleArray(keyArray); // shuffle it!
  let cities = []
  for (var i = 0; i < citiesTotal; ++i) {
    cities.push(prefectures[keyArray[i]]);
  }
  return cities
}
function App() {

  const CITIES_TOTAL = 3;

  const [currentLayer, setCurrentLayer] = useState('satellite')
  const [isPlaying, setIsPlaying] = useState(true)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentCity, setCurrentCity] = useState({
    city: "",
    location: ""
  })
  const [cities, setCities] = useState(randomCities(CITIES_TOTAL))
  const [score, setScore] = useState(0)
  const [distance, setDistance] = useState(0)

  useEffect(() => {
    console.log(cities);
  }, []);

  useEffect(() => {
    if(cities.length > 0) {
      setCurrentCity(cities[currentIndex])
    }
  }, [cities]);



  useEffect(() => {
    console.log(cities)
    console.log(currentIndex)
    if (currentIndex === CITIES_TOTAL) {
      setIsPlaying(false)
      return
    }
    setCurrentCity(cities[currentIndex])

  }, [currentIndex]);

  return (
    <div className="App">

      <div className="top">
        <div className="header">
          <div className="title">
            <h1>Pin the city&nbsp;</h1> <img src={pin} alt="React Logo" width='20px' />
          </div>

          <div className="edit-buttons">
            {currentLayer !== 'satellite' &&
              <div className="map-edit" onClick={() => setCurrentLayer('satellite')}>
                <img src={satellite} alt="satellite map" width='60px' />
                <caption>Map Terrain</caption>
              </div>
            }
            {currentLayer !== 'terrain' &&
              <div className="map-edit" onClick={() => setCurrentLayer('terrain')}>
                <img src={terrain} alt="terrain map" width='60px' />
                <caption>Map Terrain</caption>
              </div>
            }
            {currentLayer !== 'watercolor' &&
              <div className="map-edit" onClick={() => setCurrentLayer('watercolor')}>
                <img src={watercolor} alt="watercolor map" width='60px' />
                <caption>Map Dessiné</caption>
              </div>
            }
          </div>

        </div>

        <div className="game">
          <h2>Placer la ville de {Utils.capitalize(currentCity.city)} {distance > 0 && (", " + distance + " km")}</h2>
          {isPlaying && (currentIndex < CITIES_TOTAL-1) &&
            <button onClick={() => setCurrentIndex(currentIndex + 1)}>{currentIndex} Ville suivante</button>
          }
          <h2>Score : {score} </h2>
        </div>
      </div>


      <div className="box">
        <PublicMap layer={currentLayer} city={currentCity} score={score} setScore={setScore} setDistance={setDistance} />
      </div>
    </div>
  );
}

export default App;
