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
import LayerGroup from 'ol/layer/Group';
import Stamen from 'ol/source/Stamen'
import ZoomSlider from 'ol/control/ZoomSlider';
import { defaults as defaultControls } from 'ol/control';
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

function GameMap({ layer, city, score, setScore, setDistance, clicked, setClicked, showLabel }) {
    const [map, setMap] = useState(null)
    const prevLayer = usePrevious({ layer });
    const [userPoint, setUserPoint] = useState(null)
    const [cityPoint, setCityPoint] = useState(null)
    const [textPoint, setTextPoint] = useState(null)
    const [clickKey, setClickKey] = useState(null)

    const defaultZoom = 6
    const franceCenter = [302151.8127592789, 5924266.214486205] // x,y point

    const satelliteLayer = new TileLayer({
        visible: true,
        source: new XYZ({
            url: 'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=17SpgImON6btgX4D98pg',
        }),
    })
    const terrainLayer = new TileLayer({
        visible: false,
        source: new Stamen({
            layer: 'terrain-background',
        }),
    })

    const waterColorLayer = new TileLayer({
        visible: false,
        source: new Stamen({
            layer: 'watercolor',
        }),
    })
    // label can be shown between user guess
    const labelsLayer = new TileLayer({
        visible: false,
        opacity: 0.7,
        source: new Stamen({
            layer: 'terrain-labels',
        }),
    })

    const [layers, setLayers] = useState({
        'satellite': satelliteLayer,
        'terrain': terrainLayer,
        'watercolor': waterColorLayer,
        'label': labelsLayer
    })

    const updateLayerVisibility = (layerName, value) => {
        let newLayers = Object.assign({}, layers)
        newLayers[layerName].setVisible(value)
        setLayers(newLayers)
    }
    // const baseOSM = new TileLayer({
    //     source: new OSM()
    // })

    function addPin(point, rotation, srcIcon, isUser) {
        const feature = new Feature(new Point(point));
        const pinLayer = new VectorLayer({
            title: 'pin',
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

    useEffect(() => {
        const initialMap = new Map({
            target: null,
            layers: Object.values(layers),
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

    useEffect(() => {
        if (map !== null) { //TODO: fix with checking not first render
            map.setTarget("map")
            const cityLatLong = city.location.split(",")

            let eventKey = map.on('click', function (evt) {
                let userPoint = evt.coordinate
                let userLonLat = transform(userPoint, 'EPSG:3857', 'EPSG:4326');
                let cityXY = transform([cityLatLong[1], cityLatLong[0]], 'EPSG:4326', 'EPSG:3857');

                addPin(evt.coordinate, 0.15, pinUser, true)
                addPin(cityXY, -0.15, pinCity, false)

                let distance = Utils.calcCrow(cityLatLong[0], cityLatLong[1], userLonLat[1], userLonLat[0])
                setTimeout(() => {
                    smoothZoomOnPoint(cityXY, 12)
                }, 300)
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
            let newLayers = Object.assign({}, layers)
            newLayers[prevLayer.layer].setVisible(false)
            newLayers[layer].setVisible(true)
            setLayers(newLayers)
        }
    }, [layer]);

    useEffect(() => {
        if (cityPoint !== null) { // TODO: change condition
            console.log("city CHANGED", city)
            map.removeLayer(userPoint)
            map.removeLayer(cityPoint)
            map.removeLayer(textPoint)
            unByKey(clickKey)

            // prepare map for next search
            setDistance(0)
            map.getView().setZoom(defaultZoom)
            map.getView().setCenter(franceCenter)

        }
    }, [city])

    useEffect(() => {
        if (clicked) {
            unByKey(clickKey)
            setClicked(false)
        }
    }, [clicked])
    useEffect(() => {
        if (showLabel) {
            updateLayerVisibility('label', true)
        } else {
            updateLayerVisibility('label', false)
        }
    }, [showLabel])

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

export default GameMap
