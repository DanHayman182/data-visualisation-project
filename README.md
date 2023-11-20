# Data Visualisation Project

## A Visualisation of Significant Global Earthquakes 1973 - 2023

This project started as an assessed coursework project for a data visualisation course. This imposed the following constraints:
- HTML / CSS / JS only, with D3.js for visualisation
- No custom backends
- Must be fully static - no dynamic calls to web APIs allowed
- No need to support window resizing or browsers other than Chrome

I've continued to improve on the project in my own time, and have several ideas for future improvements.

The project has currently been tested on Chrome on 920x1080 and 2560x1440 monitors, by using `python -m http.server` in the project repository to host the website at `localhost:8000`.

## Data Sources

Raw data was collected from the following sources:
- Earthquake data: https://www.kaggle.com/datasets/jahaidulislam/significant-earthquake-dataset-1900-2023
- Map Geometry data: https://www.naturalearthdata.com/downloads/
- Plates Geometry: https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json

Data was pre-processed in Python, using the [`pycountry_convert`](https://github.com/jefftune/pycountry-convert/tree/master/pycountry_convert), and [`reverse_geocode`](https://github.com/richardpenman/reverse_geocode) packages. See `/data/csv-preprocessing.py` and `/data/json-preprocessing.py` for the pre-processing scripts. The processed data files are available in the `/data/` directory.

## Future Improvements

Some ideas for future improvements include:
- [ ] Reduce data duplication - earthquake data is currently stored once by continent and once by sub-continent
- [ ] Reduce code duplication - refactor `horizontalBarChart.js` and `verticalBarChart.js` to a single `histogram.js` component with orientation passed as a parameter
- [ ] Implement a Node backend - it would be useful to store data in a database instead of having to read the CSV file on each page load
- [ ] Re-write in a modern framework - convert JavaScript to TypeScript and use React (D3 has a React library)
- [ ] Add dynamic API calls - potentially integrate with ChatGPT to fetch more information about earthquakes on-the-fly
