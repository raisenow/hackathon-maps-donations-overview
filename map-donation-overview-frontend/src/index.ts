import axios from 'axios'
import './index.scss'
import {each} from 'lodash';

// const loadScript = async (url) => {
//   let script = document.createElement('script')
//   script.src = url
//   script.async = true
//   document.head.appendChild(script)
//
//   return new Promise((resolve) => {
//     script.onload = () => {
//       console.log(`script loaded: ${url}`)
//       resolve()
//     }
//   })
// }

///////////////////////////////////////////////////////////////////////////////

// The endpoint where the cantons.kml is located.
const CANTONS_KLM_URL = 'https://.../cantons.kml';

// The endpoint which returns the donation amount aggregated by canton.
const DATA_URL = 'https://...';

///////////////////////////////////////////////////////////////////////////////

const mapCont = document.getElementById('map')

const initGoogleMap = () => {
    const google = window['google'];

    const map = new google.maps.Map(mapCont, {
        center: new google.maps.LatLng(46.204391, 6.143158),
        zoom: 5,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{visibility: 'off'}]},
            {elementType: 'labels.text.fill', stylers: [{visibility: 'off'}]},
            {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{color: '#242f3e'}]
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{color: '#242f3e'}]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{color: '#242f3e'}]
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{color: '#242f3e'}]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{color: '#242f3e'}]
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{color: '#242f3e'}]
            },
            {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{color: '#242f3e'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{color: '#242f3e'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{color: '#242f3e'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{color: '#242f3e'}]
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{color: '#242f3e'}]
            },
            {
                featureType: 'transit.station',
                elementType: 'labels.text.fill',
                stylers: [{color: '#242f3e'}]
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{color: '#242f3e'}]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{color: '#242f3e'}]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [{color: '#242f3e'}]
            },
            {"featureType": "road.highway", elementType: "labels", stylers: [{visibility: "off"}]}, //turns off highway labels
            {"featureType": "road.arterial", elementType: "labels", stylers: [{visibility: "off"}]}, //turns off arterial roads labels
            {"featureType": "road.local", elementType: "labels", stylers: [{visibility: "off"}]}  //turns off local roads labels
        ]
    });

    const geoXml = new window['geoXML3'].parser({
        map: map,
        singleInfoWindow: true,
        afterParse: async (docs) => {
            geoXml.hideDocument(docs[0]);
            const elasticsearchCantonData = await fetchData();
            docs[0] = prepareCantons(docs[0], elasticsearchCantonData);

            setTimeout(() => {
              // we need to reload the entire document again to show the colors
              geoXml.showDocument(docs[0]);
            }, 500);
        },
    });

    geoXml.parse(CANTONS_KLM_URL);
    console.log("parsed");

    window['geoXml'] = geoXml;
};

const fetchData = async () => {
    const response = await axios.get(DATA_URL)

    return response.data
};

const prepareCantons = (cantons, elasticsearchCantonData) => {
        each(cantons.placemarks, (v, k) => {
            // get the data of each specific canton
            const cantonData = elasticsearchCantonData.aggregations[v.name];

            // we don't want to have a stroke
            cantons.gpolygons[k].strokeOpacity = 0;

            if (cantonData) {
                cantons.placemarks[k].polygon.infoWindowOptions.content = `
        <div id="popup-wrapper">
            <div id="popup-header">
                <div id="popup-header-left"><h1>${v.name}</h1></div>
                <div id="popup-header-right"></div>
            </div>
            <hr>
            <div id="popup-content">
                <p>${v.name} hat mit <strong>${cantonData.numberOfDonations}</strong> Solarvignetten <strong>${((cantonData.donationAmount / 100) * (1 / 0.2)).toFixed(2)} kWh </strong> Schweizer Solarenergie erworben. Und sorgt dadurch für den Bau von neuen Solaranlagen. Hilf auch du mit!</p>
                <a id="call-to-action" target="_blank" href="https://www.solarvignette.ch/#vignetten">SOLARVIGNETTE BESTELLEN</a>
            </div>
        </div>
      `

                cantons.gpolygons[k].fillColor = '#ffda00';
                cantons.gpolygons[k].fillOpacity = cantonData.donationAmount / elasticsearchCantonData.maxAmount;
            } else {
                console.log('canton not available');

                let randomAmount = Math.random() * (elasticsearchCantonData.maxAmount - elasticsearchCantonData.maxAmount/3) + elasticsearchCantonData.maxAmount/3;
                let randomNumberOfDonations = (randomAmount / 100 / 5 / 23).toFixed(0);

                // fake the data
              cantons.placemarks[k].polygon.infoWindowOptions.content = `
        <div id="popup-wrapper">
            <div id="popup-header">
                <div id="popup-header-left"><h1>${v.name}</h1></div>
                <div id="popup-header-right"></div>
            </div>
            <hr>
            <div id="popup-content">
                <p>${v.name} hat mit <strong>${randomNumberOfDonations}</strong> Solarvignetten <strong>${randomAmount.toFixed(2)} kWh </strong> Schweizer Solarenergie erworben. Und sorgt dadurch für den Bau von neuen Solaranlagen. Hilf auch du mit!</p>
                <a id="call-to-action" target="_blank" href="https://www.solarvignette.ch/#vignetten">SOLARVIGNETTE BESTELLEN</a>
            </div>
        </div>
      `

              cantons.gpolygons[k].fillColor = '#ffda00';
              cantons.gpolygons[k].fillOpacity = randomAmount / elasticsearchCantonData.maxAmount;
            }
        })
    }

;(async () => {
    // await loadScript(`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}`)
    // await loadScript('https://cdn.rawgit.com/geocodezip/geoxml3/master/polys/geoxml3.js')
    // await loadScript('https://cdn.rawgit.com/geocodezip/geoxml3/master/ProjectedOverlay.js')

    initGoogleMap()
})()

///////////////////////////////////////////////////////////////////////////////
