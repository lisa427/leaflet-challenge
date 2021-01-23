// store url to retrieve earthquake data
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//store url for plate data
    let plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// send request for the json data
d3.json(queryUrl, function(eqRes) {
    d3.json(plateUrl, function(plateRes) {
    createFeatures(eqRes.features, plateRes.features)
    })
    
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


    

    // // send request for the json data
    // d3.json(plateUrl, function(data) {
    //     // call function to create the markers for each earthquake
    //     createPlates(data.features);
    // });

    // function to create plate boundaries
    // function createPlates(plateData) {

    //     let myStyle = {
    //         "color": "#ff7800",
    //         "weight": 5,
    //         "opacity": 0.65
    //     };

    //     let plates = L.geoJSON(plateData, {
    //         style: myStyle
    //     });
    //     return plates;

    // }


// function to create the markers (circles) for each earthquake
function createFeatures(eqData, plateData) {

    // function to create popup for each earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>Magnitude: "+ feature.properties.mag +"<br>Depth: "+ feature.geometry.coordinates[2] + "</h3>");
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

    let myStyle = {
        "color": "#ff7800",
        "weight": 5,
        "opacity": 0.65
    };

    let plates = L.geoJSON(plateData, {
        style: myStyle
    });
    


    // call function to create map, pass the earthquake markers
    createMap(earthquakes, plates);
}

// function to create the map, is passed the marker data for each earthquake
function createMap(earthquakes, plates) {

    // define base layer
    let lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/light-v10",
      accessToken: API_KEY
    });

    let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // define object to hold base layer(s)
    let baseMaps = {
        "Light Map": lightmap,
        "Dark Map": darkmap
      };
    
      // define object to hold overlay layer
      let overlayMaps = {
        Earthquakes: earthquakes,
        Plates: plates
      };
  
     
    // create map
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [lightmap, earthquakes]
    });

    // create legend for depth
    let legend = L.control({position: 'bottomright'});

    // add depth legend to map
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

    // add depth legend to map
    legend.addTo(myMap);

    // add layer control to map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);
    

}
