(() => {

    /*
        TODO: 
        query the hrmbus api,
        find methods to convert that data to geoJSON,
        create multiple busIcon objects for each of the busses on the 1-10 route,
        place multiple bus markers with the rotatedmarker features for rotation,
        update the map to get the new bus positions
    */ 

    // https://hrmbusapi.herokuapp.com/
    // https://github.com/bbecquet/Leaflet.RotatedMarker
    // https://leafletjs.com/SlavaUkraini/reference.html#marker
    // https://leafletjs.com/SlavaUkraini/reference.html#geojson

    // API Call
    fetch('https://hrmbusapi.herokuapp.com/')
    .then((response) => response.json())
    .then((json) => {

        // Hold the raw data from the HRM API
        const busAPIData = json.entity;
        
        // Filter the raw data for all busses on routes 1-10 (variations include 9A, 9B, 6C, 7A, 7B)
        const rawRoutesOneToTen = busAPIData
        .filter(bus => (bus.vehicle.trip.routeId.replace(/[a-zA-Z]/g, "")) <= 10);
        
        // Store the geojson formated features
        const geojsonArray = [];

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
            .addTo(map);
        });

        console.log(geojsonArray);

        /*
            Marker accepts coordinants as latlng - geoJSON accpets coordinants as lnglat

            Create an empty geoJSON layer
                var myLayer = L.geoJSON().addTo(map)
            Add to it as geoJSON features are created from the API data
                myLayer.addData(geojsonFeature);
            
            rawRoutesOneToTen.forEach(bus => {
                bus.vehicle.position.latitude, bus.vehicle.position.longitude], 
                {
                    icon: yellowBus,
                    rotationAngle: bus.vehicle.position.bearing,
                    rotationOrigin: 'center center'
                })
                .addTo(map)
                .bindPopup(bus.vehicle.trip.routeId);
            });

        */
                
    });

    var busIcon = L.Icon.extend ({
        options: {
            iconUrl: 'bus.png',
            iconSize: [40,60],
            iconAnchor: [20, 30]
        }
    });

    var yellowBus = new busIcon();
    var bearing = 315;

    let map = L.map('theMap').setView([44.650627, -63.597140], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    // Demo bus
    L.marker([44.6702995300293, -63.57426071166992], 
        {
            icon: yellowBus, 
            rotationAngle: bearing, 
            rotationOrigin: 'center center'
        })
        .addTo(map);


})()