// store url to retrieve earthquake data
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// send request for the json data
d3.json(queryUrl, function(data) {
    // call function to create the markers for each earthquake
    createFeatures(data.features);
});

// function to return color based on depth of earthquake
function getColor(depth) {
    return depth >= 90 ? '#FF0000' :
        depth >= 70  ? '#FF5800' :
        depth >= 50  ? '#FF9300' :
        depth >= 30  ? '#FFBC00' :
        depth >= 10  ? '#BFD400' :
                '#40B100';
}

// function to create the markers (circles) for each earthquake
function createFeatures(eqData) {

    // function to create popup for each earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>Location: "+ feature.properties.place +"<br>Magnitude: "+ feature.properties.mag +"<br>Depth: "+ feature.geometry.coordinates[2] + "</h3>");
    }

    // function to return display options for each circle
    function createOptions(feature) {
        let geojsonMarkerOptions = {
            // radius is based on magnitude of each earthquake
            radius: feature.properties.mag * 5,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
            // call funtion to get color based on depth of each earthquake
            fillColor: getColor(feature.geometry.coordinates[2]) 
        };
        return geojsonMarkerOptions;

    }

    // create variable with data for each earthquake
    let earthquakes = L.geoJSON(eqData, {
        // call function to create popup info
        onEachFeature: onEachFeature,
        // create circle markers
        pointToLayer: function(feature, latlng) {
            // call function to create display options for each circle
            return L.circleMarker(latlng,createOptions(feature));
        }
    });
    // call function to create map, pass the earthquake markers
    createMap(earthquakes);
}

// function to create the map, is passed the marker data for each earthquake
function createMap(earthquakes) {

    // define base layer
    let lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/light-v10",
      accessToken: API_KEY
    });
      
    // create map
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [lightmap, earthquakes]
    });

    // create legend
    let legend = L.control({position: 'bottomright'});

    // add legend to map
    legend.onAdd = function (map) {

        // create div to add legend & add classes
        let div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 50, 70, 90];

        div.innerHTML += '<b>Depth</b><br>'

        // loop through grades and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // add legend to map
    legend.addTo(myMap);

}

