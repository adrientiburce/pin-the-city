import './App.scss';
import React, { useEffect, useState } from 'react';
import GameMap from './GameMap';
import pin from './icons/pin.svg'
import satellite from './img/satellite.png'
import terrain from './img/terrain.png'
import watercolor from './img/watercolor.png'
import prefectures from './data/prefectures.json'
import Utils from './utils.js'

function randomCities(citiesTotal) {
  let keyArray = Object.keys(prefectures);
  keyArray = Utils.shuffleArray(keyArray);
  let cities = []
  for (var i = 0; i < citiesTotal; ++i) {
    cities.push(prefectures[keyArray[i]]);
  }
  return cities
}


function App() {
  const CITIES_TOTAL = 10;

  const [currentLayer, setCurrentLayer] = useState('satellite')
  // before user click for currentCity -> don't show 'next city'  button
  const [isSearching, setIsSearching] = useState(true)
  const [clicked, setClicked] = useState(false)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentCity, setCurrentCity] = useState({
    city: "",
    location: ""
  })
  const [cities, setCities] = useState(randomCities(CITIES_TOTAL))
  const [score, setScore] = useState(0)
  const [distance, setDistance] = useState(0)
  const [showLabel, setShowLabel] = useState(false)
  const cityNumber = currentIndex + 1

  useEffect(() => {
    if (cities.length > 0) {
      setCurrentCity(cities[currentIndex])
    }
  }, [cities]);

  useEffect(() => {
    if (currentIndex < CITIES_TOTAL) {
      setIsSearching(true)
      setShowLabel(false)
    }
    setCurrentCity(cities[currentIndex])

  }, [currentIndex]);

  useEffect(() => {
    // user just clicked, search done until "next city is clicked"
    if (clicked) {
      setIsSearching(false);
    }
  }, [clicked]);

  const newGame = () => {
    setScore(0)
    setDistance(0)

    setCities(randomCities(CITIES_TOTAL))
    setCurrentIndex(0)
    setIsSearching(true)
  }

  return (
    <div className="App">

      <div className="top">
        <div className="header">
          <div className="title">
            <h1>Pin the city&nbsp;</h1> <img src={pin} alt="pin logo" width='20px' />
          </div>

          <div className="edit-buttons">
            {currentLayer !== 'satellite' &&
              <div className="map-edit" onClick={() => setCurrentLayer('satellite')}>
                <img src={satellite} alt="satellite map" width='50px' />
                <span className="map-btn">Vue Satelitte</span>
              </div>
            }
            {currentLayer !== 'terrain' &&
              <div className="map-edit" onClick={() => setCurrentLayer('terrain')}>
                <img src={terrain} alt="terrain map" width='50px' />
                <span className="map-btn">Vue Carte</span>
              </div>
            }
            {currentLayer !== 'watercolor' &&
              <div className="map-edit" onClick={() => setCurrentLayer('watercolor')}>
                <img src={watercolor} alt="watercolor map" width='50px' />
                <span className="map-btn">Vue Dessiné</span>
              </div>
            }
          </div>

        </div>

        <div className="game">
          <div className='centerVertical'>
            <h3>Quizz Préféctures</h3>
            <button className="gameCount">{cityNumber}/{CITIES_TOTAL}</button>
            {!isSearching && <div className="showLabel" >
              <input type="checkbox" name="label" id="label" onChange={() => setShowLabel(!showLabel)}/>
              <label htmlFor="label">Afficher la légende</label>
            </div>}
          </div>

          <div className='centerVertical'>
            <h2>Placer la ville : <strong className="cityToGuess">{Utils.capitalize(currentCity.city)}</strong></h2>
            <h3>{distance !== 0 && ((distance <= 1 && "distance < 1 km") || ("distance: " + Math.round(distance) + " km"))}</h3>
          </div>

          {!isSearching && (currentIndex < CITIES_TOTAL - 1) &&
            <button className="nextCity" onClick={() => setCurrentIndex(currentIndex + 1)}>Ville suivante</button>
          }
          {!isSearching && (currentIndex === CITIES_TOTAL - 1) &&
            <button className="newGame" onClick={() => newGame()}>Rejouer</button>
          }
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="score">Score : {score} </h2>
            <h3 className="score">{distance > 0 && distance < 100 && "(+ " + (100 - Math.round(distance)) + ")"}</h3>
          </div>
        </div>
      </div>


      <div className="box">
        <GameMap layer={currentLayer} city={currentCity} score={score} setScore={setScore} setDistance={setDistance}
          clicked={clicked} setClicked={setClicked} showLabel={showLabel} />
      </div>
    </div>
  );
}

export default App;
