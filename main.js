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

        /* 
        Route: json.entity[i].vehicle.trip.routeId 
        Position: json.entity[i].vehicle.position.latitude/longitude/bearing
        */

        const busAPIData = json.entity;

        // Get all the busses on route 10
        const routeTenBus = busAPIData
        .filter(bus => bus.vehicle.trip.routeId === "10");

        console.log(routeTenBus);

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

    L.marker([44.650690, -63.596537]).addTo(map)
        .bindPopup('Popup.')
        .openPopup();

    L.marker([44.6702995300293, -63.57426071166992], 
        {
            icon: yellowBus, 
            rotationAngle: bearing, 
            rotationOrigin: 'center center'
        })
        .addTo(map);


})()