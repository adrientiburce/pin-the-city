// react
import React, { useState, useEffect, useRef } from 'react';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import Text from 'ol/style/Text'
import Fill from 'ol/style/Fill'
import { unByKey } from 'ol/Observable';
import { transform } from 'ol/proj'
import XYZ from 'ol/source/XYZ'
import Stamen from 'ol/source/Stamen'
import ZoomSlider from 'ol/control/ZoomSlider';
import { defaults as defaultControls } from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';
import "ol/ol.css";

import Utils from './utils.js';
import pinCity from './icons/pinCity.png'
import pinUser from './icons/pinUser.png'


function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

function PublicMap({ layer, city, score, setScore, setDistance }) {
    const [map, setMap] = useState(null)
    const prevLayer = usePrevious({ layer });
    const [userPoint, setUserPoint] = useState(null)
    const [cityPoint, setCityPoint] = useState(null)
    const [textPoint, setTextPoint] = useState(null)
    const [clickKey, setClickKey] = useState(null)
    const [clicked, setClicked] = useState(false)

    const satelliteLayer = new TileLayer({
        source: new XYZ({
            url: 'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=17SpgImON6btgX4D98pg',
        }),
    })
    const waterColorLayer = new TileLayer({
        source: new Stamen({
            layer: 'watercolor',
        }),
    })

    const terrainLayer = new TileLayer({
        source: new Stamen({
            layer: 'terrain-background',
        }),
    })

    // const terrainLinesLayer = new TileLayer({
    //     source: new Stamen({
    //         layer: 'terrain-lines',
    //     }),
    // })

    // const baseOSM = new TileLayer({
    //     source: new OSM()
    // })

    function addPin(point, rotation, srcIcon, isUser) {
        const feature = new Feature(new Point(point));
        const pinLayer = new VectorLayer({
            source: new VectorSource({
                features: [feature]
            }),
            style: new Style({
                image: new Icon({
                    src: srcIcon,
                    scale: .8,
                    rotation: rotation,
                })
            })
        });
        const textLayer = new VectorLayer({
            source: new VectorSource({
                features: [feature]
            }),
            style: new Style({
                text: new Text({
                    text: Utils.capitalize(city.city),
                    fill: new Fill({
                        color: '#fff'
                    }),
                    offsetY: -35,
                    font: '15px Arial'
                })
            })
        })
        if (isUser) {
            setUserPoint(pinLayer)
        } else {
            map.addLayer(textLayer)
            setCityPoint(pinLayer)
            setTextPoint(textLayer)
        }
        map.addLayer(pinLayer)
    }


    const getLayer = (layerName) => {
        let usedLayer;
        switch (layerName) {
            case 'satellite':
                usedLayer = satelliteLayer
                break;
            case 'terrain':
                usedLayer = terrainLayer
                break;
            case 'watercolor':
                usedLayer = waterColorLayer
                break;
            default:
                usedLayer = terrainLayer
                break;
        }
        return usedLayer
    }

    useEffect(() => {
        const franceCenter = [302151.8127592789, 5924266.214486205] // x,y point
        const defaultZoom = 6
        const initialMap = new Map({
            target: null,
            layers: [getLayer(layer)],
            view: new View({
                center: franceCenter,
                zoom: defaultZoom,
                maxZoom: 12,
                minZoom: 4,
            }),
            controls: defaultControls().extend([new ZoomSlider()]),
        })
        setMap(initialMap);
    }, [])

    const unBindKey = () => {
        console.log(clickKey)
        unByKey(clickKey)
    }
    useEffect(() => {
        if (map !== null) { //TODO: fix with checking not first render
            map.setTarget("map")
            const cityLayLong = city.location.split(",")

            let eventKey = map.on('click', function (evt) {
                let userPoint = evt.coordinate
                let userLonLat = transform(userPoint, 'EPSG:3857', 'EPSG:4326');
                let cityXY = transform([cityLayLong[1], cityLayLong[0]], 'EPSG:4326', 'EPSG:3857');

                addPin(evt.coordinate, 0.15, pinUser, true)
                addPin(cityXY, -0.15, pinCity, false)

                let distance = Utils.calcCrow(cityLayLong[0], cityLayLong[1], userLonLat[1], userLonLat[0])
                setTimeout(() => {
                    smoothZoomOnPoint(cityXY, 12)
                }, 200)
                let roundedDistance = Math.round(distance)
                console.log("D", distance)

                setDistance(roundedDistance)
                if (distance < 100) {
                    setScore(score + 100 - roundedDistance)
                }
                setClicked(true)
            })
            setClickKey(eventKey)
        }
    }, [city]);

    useEffect(() => {
        if (map != null) {
            map.removeLayer(getLayer(prevLayer.layer))
            map.addLayer(getLayer(layer))
        }
    }, [layer]);

    useEffect(() => {
        if (cityPoint !== null) { // TODO: change condition
            console.log("city CHANGED", city)
            map.removeLayer(userPoint)
            map.removeLayer(cityPoint)
            map.removeLayer(textPoint)
            unByKey(clickKey)
            setDistance(0)
        }
    }, [city])

    useEffect(() => {
        if (clicked) {
            unByKey(clickKey)
            setClicked(false)
        }
    }, [clicked])


    function smoothZoomOnPoint(point, zoom) {
        map.getView().animate({
            center: point,
            zoom: zoom
        })
    }

    return (
        <div id="map" className="map-container"></div>
    )
}

export default PublicMap
