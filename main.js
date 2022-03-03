(() => {
    // Create the map
    let map = L.map('theMap').setView([44.650627, -63.597140], 14);

    // Add the tile
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
        .addTo(map);

    // Create an icon for the bus
    var busIcon = L.Icon.extend ({
        options: {
            iconUrl: 'bus.png',
            iconSize: [40,60],
            iconAnchor: [20, 30]
        }
    });

    // Create an object for the bus icon
    var yellowBus = new busIcon();

    const apiUrl = 'https://hrmbusapi.herokuapp.com/';
    let rawApiData = null;
    let geojsonFeatureArray = [];
    let geojsonFeatureLayer = null;
    
    async function getBusses() {
        fetch(apiUrl)
        .then((response) => response.json())
        .then(json => {

            // Hold the raw data from the HRM API
            rawApiData = json.entity;

            // Clear the previous layer
            if (geojsonFeatureArray.length != 0) {
                 
                // Clear the array
                geojsonFeatureArray = [];

                // Clear the map
                clearGeoJsonLayer();

                // Clear the console
                console.clear();
            }

            let rawRoutesOneToTen = filterApiData(rawApiData);

            buildGeoJsonFeatures(rawRoutesOneToTen);

            addGeoJsonLayersToMap(geojsonFeatureArray);

            console.log(geojsonFeatureArray);     
        });
    };

    // Call the function on page load
    getBusses();

    // Refresh the data to update locations
    setInterval(getBusses, 12000);

    // Filter the raw data for all busses on routes 1-10 (variations include 9A, 9B, 6C, 7A, 7B)
    function filterApiData(data) {
        
        let targetRoutes = data
        .filter(route => (route.vehicle.trip.routeId.replace(/[a-zA-Z]/g, "")) <= 10);

        return targetRoutes;
    };

    function buildGeoJsonFeatures(arr) {

        arr.forEach(route => {

            // Transform raw data to geoJSON format
            var geojsonFeature = {
                "type": "Feature",
                "properties": {
                    "name": route.vehicle.vehicle.id,
                    "bearing": route.vehicle.position.bearing,
                    "popupContent": "Route " + route.vehicle.trip.routeId
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [route.vehicle.position.longitude, route.vehicle.position.latitude]
                }
            };

            // Add the feature to the array
            geojsonFeatureArray.push(geojsonFeature);
        });
    };

    function addGeoJsonLayersToMap(arr) {
        
        // Create the geojson feature layer
        geojsonFeatureLayer = L.geoJSON(arr, {
                
            onEachFeature: onEachFeature,
            pointToLayer: function (feature, latlng) {

                // Update default marker, add direction (bearing)
                return L.marker(latlng, {
                    icon: yellowBus, 
                    rotationAngle: feature.properties.bearing, 
                    rotationOrigin: 'center center'
                });
            }
        });

        // Add the geojson layer to the map
        geojsonFeatureLayer
        .addTo(map);
    };

    function clearGeoJsonLayer() {

        map.removeLayer(geojsonFeatureLayer);
    };

    function onEachFeature(feature, layer) {

        if (feature.properties && feature.properties.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
        }
    }
})()