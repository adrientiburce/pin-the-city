// react
import React, { useState, useEffect , useRef} from 'react';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import Stamen from 'ol/source/Stamen'
import "ol/ol.css";
import ZoomSlider from 'ol/control/ZoomSlider';
import { defaults as defaultControls } from 'ol/control';
import { prettyDOM } from '@testing-library/dom';

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
}

  
function PublicMap({ layer }) {
    const [map, setMap] = useState()
    const prevLayer = usePrevious({layer});
    // const [currentLayer, setCurrentLayer] = useState(layer)

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

    // initialize map on first render - logic formerly put into componentDidMount
    useEffect(() => {
        console.log("use effect", layer)
        const franceCenter = [302151.8127592789, 5924266.214486205] // x,y point
        const defaultZoom = 6

        // const baseOSM = new TileLayer({
        //     source: new OSM()
        // })

        // create map
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
        initialMap.setTarget("map")

    }, [])

    useEffect(() => {
        if (map != null) {
            console.log(prevLayer.layer, layer)
            map.removeLayer(getLayer(prevLayer.layer))
            map.addLayer(getLayer(layer))
        }
    }, [layer]);


    // render component
    return (
        <>
            <div id="map" className="map-container"></div>
        </>
    )
}

export default PublicMap
