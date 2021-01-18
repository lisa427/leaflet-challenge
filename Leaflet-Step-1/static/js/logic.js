// store url to retrieve earthquake data
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// send request for the json data
d3.json(queryUrl, function(data) {
    createFeatures(data.features);
});

function createFeatures(eqData) {

    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>Magnitude: "+ feature.properties.mag +"<br>Depth: "+ feature.geometry.coordinates[2] + "</h3>");
      }

    function getColor(feature) {
        let depth = feature.geometry.coordinates[2];
        let color = "#FF0000";
        if (depth < 10) {
            color =  "#40B100";
        } 
        else if (depth >= 10 && depth <30) {
            color = "#BFD400";
        }
        else if (depth >= 30 && depth <50) {
            color = "#FFBC00";
        }
        else if (depth >= 50 && depth <70) {
            color = "#FF7600";
        }
        else if (depth >= 70 && depth <90) {
            color = "#FF5800";
        }
        else {
            color = "#FF0000";
        }
        return color;
    }

    
    function createOptions(feature) {
        let geojsonMarkerOptions = {
            radius: feature.properties.mag * 5,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
            fillColor: getColor(feature) 
        };
        return geojsonMarkerOptions;

    }

    let earthquakes = L.geoJSON(eqData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng,createOptions(feature));
        }
    });

    console.log(eqData);

    createMap(earthquakes);
}

function createMap(earthquakes) {

    // define base layer
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/light-v10",
      accessToken: API_KEY
    });
    
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Light Map": lightmap,
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [lightmap, earthquakes]
    });
}
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
//     L.control.layers(baseMaps, overlayMaps, {
//       collapsed: false
//     }).addTo(myMap);
//   }