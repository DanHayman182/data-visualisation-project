import { button } from './components/button.js';
import { checkbox } from './components/checkbox.js';
import { dropdownMenu } from './components/dropdownMenu.js';
import { HorizontalBarChart } from './components/horizontalBarChart.js'
import { VerticalBarChart } from './components/verticalBarChart.js'
import {
    backButtonHandler, magBrushHandler, yearBrushHandler, updateMonthScales,
    citySelector, magnitudeSelector, plateBoundarySelector, regionGroupSelector, yearSelector,
    continentClickHandler, continentSelectedHandler, hideExtraControls
} from './clickHandlers.js';
import { GlobalView } from './views/globalView.js';
import { loadAndProcessData, continentList, magContinentCounts, continentCoordinates } from './loadAndProcessData.js';
import { VisController } from './visController.js';

const svg = d3.select('svg');
const visController = new VisController(svg);

loadAndProcessData().then(loadedData => {
    // Load data and set initial internal state variables
    visController.countries110m        = loadedData['countries110m'];
    visController.countries50m         = loadedData['countries50m'];
    visController.countries10m         = loadedData['countries10m'];
    visController.continentData        = loadedData['continentData'];
    visController.subContinentData     = loadedData['subContinentData'];
    visController.plates               = loadedData['plates'];
    visController.cities110m           = loadedData['cities110m'];
    visController.cities50m            = loadedData['cities50m'];
    visController.groupByRegion        = true;
    visController.showPlateBoundaries  = false;
    visController.showCities           = false;
    visController.showMagnitudes       = false;
    visController.showYears            = false;
    visController.showingRadialGraphs  = false;
    visController.radialCommonScale    = true;
    visController.yearBrushLeft        = 1973;
    visController.yearBrushRight       = 2023;
    visController.magBrushBottom       = 5.5;
    visController.magBrushTop          = 9.5;
    visController.zoomLevel            = 0;

    // Merge all data points into a single list of data.
    visController.allQuakes = continentList.reduce(
        (acc, cont) => acc.concat(visController.continentData[cont]), []);

    // Compute global colour scale for magnitude bands
    visController.colourScale = d3.scaleOrdinal()
        .domain([5, 6, 7, 8, 9])
        .range([5.5, 6.5, 7.5, 8.5, 9.5].map(d => d3.interpolateInferno(0.85 - (d - 5) / 6)));

    // Scale for earthquake magnitudes
    visController.quakeRadiusScale = d3.scaleSqrt()
        .domain(d3.extent(visController.allQuakes, d => d.mag))
        .range([2.5, 6]);

    // Initialise all main controls
    d3.select('#plate-switch').call(checkbox, {
        id: 'plate-selector',
        labelText: 'Show tectonic plates',
        isChecked: visController.showPlateBoundaries,
        tooltipHTML: '<p>Show/hide tectonic plate boundaries on the map.</p>',
        onBoxClicked: (event) => plateBoundarySelector(visController, event)
    });
    d3.select('#region-switch').call(checkbox, {
        id: 'region-selector',
        labelText: 'Group by region',
        isChecked: visController.groupByRegion,
        tooltipHTML: `
            <p>Aggregate earthquakes into regions if selected.</p>
            <p>Show individual earthquakes if not selected.</p>
            <p>Not available at sub-continent or city zoom level.</p>`,
        onBoxClicked: (event) => regionGroupSelector(visController, event)
    });
    d3.select('#city-switch').call(checkbox, {
        id: 'cities-selector',
        labelText: 'Show major cities',
        isChecked: visController.showCities,
        tooltipHTML: `
            <p>Show/hide major cities on the map.</p>
            <p>Click on a city to zoom in.</p>
            <p>Only available at higher zoom levels.</p>`,
        onBoxClicked: (event) => citySelector(visController, event)
    });
    d3.select('#mag-switch').call(checkbox, {
        id: 'mag-selector',
        labelText: 'Show magnitudes',
        isChecked: visController.showMagnitudes,
        tooltipHTML: `
            <p>Colour earthquakes according to their magnitude.</p>
            <p>Only available in un-grouped view at higher zoom levels.</p>`,
        onBoxClicked: (event) => magnitudeSelector(visController, event)
    });
    d3.select('#year-switch').call(checkbox, {
        id: 'year-selector',
        labelText: 'Show years',
        isChecked: visController.showYears,
        tooltipHTML: `
            <p>Colour earthquakes according to their year.</p>
            <p>Only available in un-grouped view  at higher zoom levels.</p>`,
        onBoxClicked: (event) => yearSelector(visController, event)
    });
    d3.select('#continent-select').call(dropdownMenu, {
        optionClass: 'continent-option',
        options: ['Global'].concat(continentList),
        selected: 'Global',
        labelText: 'Select continent',
        tooltipHTML: '<p>Select a continent to zoom in, or return to global view.</p>',
        selectHandler: (event) => continentSelectedHandler(visController, event)
    });
    d3.select('#play-through').call(button, {
        className: 'play-through',
        labelText: 'Year: All',
        buttonText: '\u25B6 Animate Years \u24D8',
        tooltipHTML: `
            <p>Press to play an animation showing earthquakes through the 50 years.</p>
            <p>Only available in un-grouped view  at higher zoom levels.</p>`,
        onClick: () => visController.regionView.animationControl(
            visController.yearBrushRight, visController.yearBrushLeft,
            visController.magBrushBottom, visController.magBrushTop),
    });
    d3.select('#radial-button').call(button, {
        className: 'show-radial-layout',
        labelText: '',
        buttonText: 'Summarise by month',
        tooltipHTML: `<p>Show a summary of earthquakes in the visible regions by month.</p>`,
        onClick: () => visController.showMonthSummaryView(),
    });
    d3.select('#close-radial-button').call(button, {
        className: 'hide-radial-layout',
        labelText: '',
        buttonText: '\u274c',
        tooltipHTML: `<p>Return to map view.</p>`,
        onClick: () => visController.hideMonthSummaryView(),
    }).style('display', 'none');
    d3.select('#radial-scale-checkbox').call(checkbox, {
        id: 'radial-scale',
        labelText: 'Common scale',
        isChecked: visController.radialCommonScale,
        tooltipHTML: `<p>Switch between individual and common scales.</p>`,
        onBoxClicked: (event) => updateMonthScales(visController, event),
    }).style('display', 'none');
    d3.select('#back-button').call(button, {
        className: 'back-button',
        labelText: '',
        buttonText: 'Back',
        tooltipHTML: '',
        onClick: () => backButtonHandler(visController),
    }).style('display', 'none');
    d3.select('#reset-zoom-button').call(button, {
        className: 'reset-button',
        labelText: '',
        buttonText: 'Reset Zoom',
        tooltipHTML: '',
        onClick: () => visController.regionView.resetZoom(500),
    }).style('display', 'none');

    // Construct initial global view
    visController.globalView = new GlobalView(svg, {
        margin: {left: 10, right: 150, top: 10, bottom: 130},
        countries: visController.countries110m,
        earthquakes: visController.allQuakes,
        plates: visController.plates,
        countGroups: magContinentCounts,
        pieColourScale: d => visController.colourScale(Math.floor(d)),
        pieClickHandler: name => continentClickHandler(visController, name),
        pieCoordinates: continentCoordinates,
    });

    // Construct histograms
    visController.horizontalBarChart = new HorizontalBarChart(svg, {
        margin: {left: 45, right: 120, top: 10, bottom: 20},
        chartHeight: 75,
        data: loadedData['yearFrequencies'],
        xValue: d => d.year,
        yValue: d => d.frequency,
        filterField: d => d.mag,
        indexMap: d => +d.time.getFullYear() - 1973,
        continuousColourScale: d => d3.interpolateSinebow(0.5 + (d - 1973) / 100),
        fixedColour: '#007e6f',
        externalHandler: (bl, br) => yearBrushHandler(visController, bl, br),
        xAxisLabel: 'Year',
    });

    visController.verticalBarChart = new VerticalBarChart(svg, {
        margin: {left: 10, right: 40, top: 10, bottom: 160},
        chartWidth: 75,
        data: loadedData['magnitudeFrequencies'],
        xValue: d => d.magnitude,
        yValue: d => d.frequency,
        filterField: d => +d.time.getFullYear(),
        indexMap: d => Math.round(10 * d.mag - 55),
        continuousColourScale: d => d3.interpolateInferno(0.85 - (d - 5) / 6),
        groupedColourScale: d => visController.colourScale(Math.floor(d)),
        fixedColour: '#007e6f',
        externalHandler: (bb, bt) => magBrushHandler(visController, bb, bt),
        xAxisLabel: 'Magnitude',
    });

    // Append SVG clip-path
    svg.append('defs').append('clipPath').attr('id', 'clip-path')
        .append('rect').attr('id', 'clip-rect');

    // Draw colour legend and disable controls that are not available initially
    hideExtraControls(true);
    visController.updateColourLegend('vertical')
    visController.updateVis();
});
