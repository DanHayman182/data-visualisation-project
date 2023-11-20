export const continentList = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

// Coordinates for the centre of each continent to position pie charts
export const continentCoordinates = {'Europe': [10,48], 'Asia': [90,40], 'Oceania': [140,-15],
    'North America': [-100,40], 'South America': [-60,-10], 'Africa': [20,10]};

// Center coordinates and scale factors for constrained zoom into each continent
export const continentBounds = {
    'Africa': {centerX: 8, centerY: 12, scale: 450},
    'Asia': {centerX: 78, centerY: 42, scale: 350},
    'Europe': {centerX: -2, centerY: 60, scale: 500},
    'Oceania': {centerX: 96, centerY: -3, scale: 400},
    'North America': {centerX: -112, centerY: 46, scale: 450},
    'South America': {centerX: -76, centerY: -16, scale: 400},
};

// Sub-continents that should be shown in each continent
export const subContinentMappings = {
    'Africa': ['Northern Africa', 'Eastern Africa', 'Southern Africa', 'Western Africa', 'Middle Africa'],
    'Asia': ['Eastern Asia', 'Southern Asia', 'Western Asia', 'Central Asia', 'South-eastern Asia'],
    'Europe': ['Northern Europe', 'Eastern Europe', 'Southern Europe', 'Western Europe'],
    'Oceania': ['Polynesia', 'Melanesia', 'Micronesia', 'Australia and New Zealand'],
    'North America': ['Northern America', 'Central America', 'Caribbean'],
    'South America': ['Southern America', 'Central America', 'Caribbean'],
};

// Coordinates of where to position sub-continent pie charts by continent
export const subContinentCoordinates = {
    'Africa': { 'Northern Africa': [15,30], 'Eastern Africa': [40,5], 'Southern Africa': [25,-25],
        'Western Africa': [0,10], 'Middle Africa': [15,0] },
    'Asia': { 'Eastern Asia': [130,40], 'Southern Asia': [80,20], 'Western Asia': [40,35], 'Central Asia': [60,40],
        'South-eastern Asia': [110,5] },
    'Europe': { 'Northern Europe': [10,60], 'Eastern Europe': [30,53], 'Southern Europe': [20,42],
        'Western Europe': [0,48] },
    'Oceania': { 'Polynesia': [175,-5], 'Melanesia': [160,-20], 'Micronesia': [150,10],
        'Australia and New Zealand': [155,-40] },
    'North America': { 'Northern America': [-100,45], 'Central America': [-100,20], 'Caribbean': [-70,15] },
    'South America': { 'Southern America': [-60,-20], 'Central America': [-90,10], 'Caribbean': [-60,10] },
};

// Center coordinates and scale factors for constrained zoom into each sub-continent
export const subContinentBounds = {
    'Northern Africa': {centerX: 7, centerY: 36, scale: 900},
    'Eastern Africa': {centerX: 35, centerY: 10, scale: 900},
    'Southern Africa': {centerX: 24, centerY: -19, scale: 1000},
    'Western Africa': {centerX: -8, centerY: 12, scale: 900},
    'Middle Africa': {centerX: 10, centerY: 8, scale: 1000},
    'Eastern Asia': {centerX: 107, centerY: 45, scale: 600},
    'Southern Asia': {centerX: 75, centerY: 30, scale: 700},
    'Western Asia': {centerX: 42, centerY: 35, scale: 800},
    'Central Asia': {centerX: 57, centerY: 40, scale: 800},
    'South-eastern Asia': {centerX: 112, centerY: 12, scale: 700},
    'Northern Europe': {centerX: 0, centerY: 67, scale: 800},
    'Eastern Europe': {centerX: 26, centerY: 55, scale: 1000},
    'Southern Europe': {centerX: 15, centerY: 45, scale: 1000},
    'Western Europe': {centerX: -10, centerY: 52, scale: 1000},
    'Polynesia': {centerX: 146, centerY: 0, scale: 1000},
    'Melanesia': {centerX: 146, centerY: -20, scale: 1000},
    'Micronesia': {centerX: 138, centerY: 12, scale: 1000},
    'Australia and New Zealand': {centerX: 138, centerY: -26, scale: 800},
    'Northern America': {centerX: -120, centerY: 52, scale: 600},
    'Central America': {centerX: -100, centerY: 25, scale: 800},
    'Caribbean': {centerX: -77, centerY: 23, scale: 1000},
    'Southern America': {centerX: -76, centerY: -16, scale: 400},
};

// Frequency of earthquakes in each magnitude band by continent
export const magContinentCounts = {
    'Europe': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    'Asia': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    'Oceania': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    'North America': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    'South America': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    'Africa': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0}
};

// Frequency of earthquakes in each magnitude band by sub-continent
export const magSubContinentCounts = {
    'Africa': {
        'Northern Africa': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Eastern Africa': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Southern Africa': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Western Africa': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Middle Africa': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    },
    'Asia': {
        'Eastern Asia': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Southern Asia': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Western Asia': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Central Asia': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'South-eastern Asia': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    },
    'Europe': {
        'Northern Europe': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Eastern Europe': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Southern Europe': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Western Europe': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    },
    'Oceania': {
        'Polynesia': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Melanesia': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Micronesia': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Australia and New Zealand': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    },
    'North America': {
        'Northern America': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Central America': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Caribbean': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    },
    'South America': {
        'Southern America': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Central America': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
        'Caribbean': {5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    },
};

// Map numeric month (0 - 11) to initial of month name
export const monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
    'October', 'November', 'December'];

// Location on screen to display radial stacked bar charts depending on the number of small multiples
export const radialPlacements = {
    1: [[520, 300]],
    3: [[200, 200], [840, 200], [520, 400]],
    4: [[208, 160], [624, 160], [416, 430], [832, 430]],
    5: [[200, 150], [520, 150], [840, 150], [360, 435], [680, 435]],
    6: [[150, 150], [450, 150], [750, 150], [300, 435], [600, 435], [900, 435]],
};

// Inner and outer radii of radial stacked bar charts depending on the number of small multiples
export const radialRadii = {
    1: [50, 250],
    3: [45, 175],
    4: [45, 145],
    5: [40, 140],
    6: [40, 135],
};

export const loadAndProcessData = () =>
    // Load all data files
    Promise
        .all([
            d3.json('./data/countries-110m.json'),
            d3.json('./data/countries-50m.json'),
            d3.json('./data/countries-10m.json'),
            d3.json('./data/tectonic-plates.json'),
            d3.json('./data/cities-110m.json'),
            d3.json('./data/cities-50m.json'),
            d3.csv('./data/earthquake-dataset-1973-2023.csv')
        ])
        .then(([topoData_countries110m, topoData_countries50m, topoData_countries10m,
                   topoData_plates, topoData_cities110m, topoData_cities50m, earthquakes]) => {
            // Conversion from TopoJSON to GeoJSON
            const countries110m = topojson.feature(topoData_countries110m, topoData_countries110m.objects.countries);
            const countries50m = topojson.feature(topoData_countries50m, topoData_countries50m.objects.countries);
            const countries10m = topojson.feature(topoData_countries10m, topoData_countries10m.objects.countries);

            const plates = topojson.feature(topoData_plates, topoData_plates.objects.plates);

            const cities110m = topojson.feature(topoData_cities110m, topoData_cities110m.objects.cities);
            const cities50m = topojson.feature(topoData_cities50m, topoData_cities50m.objects.cities);

            // Construct empty data-sets for the histograms
            const yearFrequencies = [];
            for (let i = 0; i <= 2023 - 1973; i++) {
                yearFrequencies[i] = {
                    year: i + 1973,
                    frequency: 0,
                };
            }

            const magnitudeFrequencies = [];
            for (let i = 0; i <= 40; i++) {
                magnitudeFrequencies[i] = {
                    magnitude: 5.5 + i / 10,
                    frequency: 0,
                };
            }

            // Create empty data-sets for earthquakes by continent and by sub-continent
            const continentData = {'Asia': [], 'Africa': [], 'Europe': [], 'North America': [],
                'South America': [], 'Oceania': []};
            const subContinentData = {
                'Northern Africa': [], 'Eastern Africa': [], 'Southern Africa': [], 'Western Africa': [], 'Middle Africa': [],
                'Eastern Asia': [], 'Southern Asia': [], 'Western Asia': [], 'Central Asia': [], 'South-eastern Asia': [],
                'Northern Europe': [], 'Eastern Europe': [], 'Southern Europe': [], 'Western Europe': [],
                'Polynesia': [], 'Melanesia': [], 'Micronesia': [], 'Australia and New Zealand': [],
                'Northern America': [], 'Central America': [], 'Caribbean': [], 'Southern America': []
            };
            earthquakes.forEach(d => {
                // Extract required features from each earthquake entry, and round magnitude to 1 d.p.
                d.latitude = +d.latitude;
                d.longitude = +d.longitude;
                d.mag = +(+d.mag).toFixed(1);
                d.time = new Date(d.time);

                // Add each entry to the continent and sub-continent data sets, and add to the histogram data-sets
                continentData[d.continent].push(d);
                subContinentData[d.sub_continent].push(d);
                yearFrequencies[+d.time.getFullYear() - 1973].frequency++;
                magnitudeFrequencies[Math.round(10 * d.mag - 55)].frequency++;
            });

            // Return object containing loaded data
            return {
                countries110m: countries110m,
                countries50m: countries50m,
                countries10m: countries10m,
                continentData: continentData,
                subContinentData: subContinentData,
                plates: plates,
                cities110m: cities110m,
                cities50m: cities50m,
                yearFrequencies: yearFrequencies,
                magnitudeFrequencies: magnitudeFrequencies,
            }
        });

