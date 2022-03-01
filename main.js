(() => {

    /*
        TODO: 
        update the map to get the new bus positions
    */ 

    var busAPIData = null;
    const geojsonArray = [];

    // Create an icon for the bus
    var busIcon = L.Icon.extend ({
        options: {
            iconUrl: 'bus.png',
            iconSize: [40,60],
            iconAnchor: [20, 30]
        }
    });

    var yellowBus = new busIcon();

    // API Call
    fetch('https://hrmbusapi.herokuapp.com/')
    .then((response) => response.json())
    .then((json) => {

        // Hold the raw data from the HRM API
        busAPIData = json.entity;
        
        // Filter the raw data for all busses on routes 1-10 (variations include 9A, 9B, 6C, 7A, 7B)
        const rawRoutesOneToTen = busAPIData
        .filter(bus => (bus.vehicle.trip.routeId.replace(/[a-zA-Z]/g, "")) <= 10);

        // Create the geoJSON features
        rawRoutesOneToTen.forEach(bus => {

            // Transform raw data to geoJSON format
            var geojsonFeature = {
                "type": "Feature",
                "properties": {
                    "name": bus.vehicle.trip.routeId,
                    "bearing": bus.vehicle.position.bearing,
                    "popupContent": "Route " + bus.vehicle.trip.routeId
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [bus.vehicle.position.longitude, bus.vehicle.position.latitude]
                }
            };

            // Add the feature to the array
            geojsonArray.push(geojsonFeature);
        });

        // Add the feature to the map
        geojsonArray.forEach(geojsonFeature => {
            
            L.geoJSON(geojsonFeature, {
                pointToLayer: function (feature, latlng) {

                    // Change the default marker to a bus and add to the map
                    return L.marker(latlng, {
                        icon: yellowBus, 
                        rotationAngle: feature.properties.bearing, 
                        rotationOrigin: 'center center'
                    });
                }
            })
            .addTo(map)
            .bindPopup(geojsonFeature.properties.popupContent);
        });

        console.log(geojsonArray);     
    });

    let map = L.map('theMap').setView([44.650627, -63.597140], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
        .addTo(map);

})()