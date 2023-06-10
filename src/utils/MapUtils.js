export const MapUtils = {
    // aggregate county level raw data to states and nations levels
    convertCovidPoints: function(countyLevelPoints) {
        if (!countyLevelPoints) { // sanity check
            return {};
        }

        let result = {
            'county': countyLevelPoints,
            'state': {},
            'nation': {}
        };
        let stateData = {};
        let nationData = {};
        // aggregate data by state
        for (const point of countyLevelPoints) {
            // sanity check
            if (Number.isNaN(point.stats.confirmed) || Number.isNaN(point.stats.deaths)) {
                console.error('Got dirty data: ', point);
                continue;
            }
            // Initialize the new province
            if (!stateData[point.province]) {
                stateData[point.province] = {
                    confirmed: 0,
                    deaths: 0,
                };
                // initialize坐标和country
                stateData[point.province].coordinates = point.coordinates;
                stateData[point.province].country = point.country;
            }
            // aggregate
            stateData[point.province].confirmed += point.stats.confirmed;
            stateData[point.province].deaths += point.stats.deaths;

            // aggregate data by nation
            if (!nationData[point.country]) {
                nationData[point.country] = {
                    confirmed: 0,
                    deaths: 0,
                };
                nationData[point.country].coordinates = point.coordinates;
            }
            nationData[point.country].confirmed += point.stats.confirmed;
            nationData[point.country].deaths += point.stats.deaths;
        }
        result['state'] = stateData;
        result['nation'] = nationData;
        return result;
    },
    isInBoundary: function (bounds, coordinates) {
        return coordinates && bounds && bounds.nw && bounds.se &&
         (
             //longitude - 经度, west小 east大
             (coordinates.longitude >= bounds.nw.lng && coordinates.longitude <= bounds.se.lng))
            && 
            //latitude - 纬度，south小 north大
            ((coordinates.latitude >= bounds.se.lat && coordinates.latitude <= bounds.nw.lat));
    },
    getPointsLevelByZoomLevel: function(zoomLevel) {
        // zoomLevel -> determine county / state / nation level
        // 1 - 4: nation level (US)
        // 5 - 9: state level
        // 10 - 20: county level
        if (zoomLevel >= 1 && zoomLevel <= 4) {
            return 'nation';
        } else if (zoomLevel > 4 && zoomLevel <= 9) {
            return 'state';
        }
        return 'county';
    }
};