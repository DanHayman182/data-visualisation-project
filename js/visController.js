import { colourBar } from './components/colourBar.js';
import { colourLegend } from './components/colourLegend.js';
import { dropdownMenu } from './components/dropdownMenu.js';
import {
    hideExtraControls, hideUnGroupedSwitches, subContinentClickHandler, subContinentSelectedHandler
} from './clickHandlers.js';
import {
    continentList, continentBounds, subContinentMappings, subContinentBounds,
    magSubContinentCounts, subContinentCoordinates
} from './loadAndProcessData.js';
import { RegionView } from './views/regionView.js';
import { MonthView } from './views/monthView.js';

export class VisController {
    countries110m; countries50m; countries10m; continentData; subContinentData; plates; cities110m; cities50m;
    yearBrushLeft; yearBrushRight; magBrushBottom; magBrushTop; globalView; horizontalBarChart; verticalBarChart;
    regionView; radialCommonScale; allQuakes; colourScale; colourLegendGroup; quakeRadiusScale; showPlateBoundaries;
    groupByRegion; showCities; showMagnitudes; showYears; continentSelected; subContinentSelected; citySelected;
    zoomLevel; regionQuakes;

    constructor(_svg) {
        this.svg = _svg;
    }

    // On transition to month summary view
    showMonthSummaryView() {
        let vis = this;

        vis.showingRadialGraphs = true;

        let props = {
            colourScale: vis.colourScale,
        };
        // Determine which radial graphs will be shown and which data-set to use
        if (vis.zoomLevel === 0) {
            // Hide any pie charts currently displayed
            Object.values(vis.globalView.pieCharts).forEach(pie => pie.g.style('display', 'none'));
            vis.globalView.g.style('display', 'none');

            props.monthRegionList = continentList;
            props.monthEarthquakeSelector = d => continentList.indexOf(d.continent);
            props.monthQuakes = vis.allQuakes;
        } else if (vis.zoomLevel === 1) {
            Object.values(vis.regionView.pieCharts).forEach(pie => pie.g.style('display', 'none'));
            vis.regionView.outerGroup.style('display', 'none');

            props.monthRegionList = subContinentMappings[vis.continentSelected];
            props.monthEarthquakeSelector = d => subContinentMappings[vis.continentSelected].indexOf(d.sub_continent);
            props.monthQuakes = subContinentMappings[vis.continentSelected].reduce(
                (acc, subcont) => acc.concat(vis.subContinentData[subcont]), []);
        } else if (vis.zoomLevel === 2) {
            vis.regionView.outerGroup.style('display', 'none');

            props.monthRegionList = [vis.subContinentSelected];
            props.monthEarthquakeSelector = () => 0;
            props.monthQuakes = vis.subContinentData[vis.subContinentSelected];
        } else {
            vis.regionView.outerGroup.style('display', 'none');

            props.monthRegionList = [vis.citySelected];
            props.monthEarthquakeSelector = () => 0;
            props.monthQuakes = vis.regionQuakes;
        }

        vis.monthView = new MonthView(vis.svg, props);
        vis.updateAll()
    }

    // On pressing the close button, return to view before pressing month summary view
    hideMonthSummaryView() {
        let vis = this;

        vis.showingRadialGraphs = false;
        vis.monthView.hide();

        // Return to previous view
        if (vis.zoomLevel === 0) {
            if (vis.groupByRegion) Object.values(vis.globalView.pieCharts).forEach(
                pie => pie.g.style('display', 'block'));
            vis.globalView.g.style('display', 'block');
        } else {
            if (vis.groupByRegion) Object.values(vis.regionView.pieCharts).forEach(
                pie => pie.g.style('display', 'block'));
            vis.regionView.outerGroup.style('display', 'block');
            d3.select('#back-button').style('display', 'block');
        }

        vis.updateAll();
    }

    // On zooming in to focus on a city
    zoomToLevel3(name, country, coordinates) {
        let vis = this;

        // Hide any visible pie charts
        vis.regionView.hide();

        vis.citySelected = name + ', ' + country;
        vis.zoomLevel = 3;

        // Show hide/relevant controls for this zoom level
        hideUnGroupedSwitches(false);
        vis.svg.selectAll('g.colour-legend').remove();
        d3.select('#region-switch input').property('disabled', true);
        d3.select('#region-switch .checkbox-label').classed('disabled', true);
        d3.select('#radial-button').style('display', 'block');
        d3.select('#back-button').style('display', 'block');
        d3.select('#reset-zoom-button').style('display', 'none');

        // Construct a new region view centred on the city, at an appropriate scaling for the city latitude
        vis.regionView = new RegionView(vis.svg, {
            name: vis.citySelected,
            margin: {left: 10, right: 130, top: 10, bottom: 130},
            scaling: {
                centerX: coordinates[0] - 0.7,
                centerY: coordinates[1] + 0.65,
                scale: 2000 + 6000 * (90 - Math.abs(coordinates[1])) / 90,
            },
            countries: vis.countries10m,
            earthquakes: vis.allQuakes,
            plates: vis.plates,
            cities: vis.cities50m,
            showPlateBoundaries: vis.showPlateBoundaries,
            showCities: vis.showCities,
            showMagnitudes: vis.showMagnitudes,
            showYears: vis.showYears,
            cityClickHandler: (n, c, cc) => vis.zoomToLevel3(n, c, cc),
            cityCenter: {name: name, coordinates: coordinates},
            allowZoom: true,
            radiusScale: vis.quakeRadiusScale,
        });

        // Retrieve earthquakes that were filtered out by the projection bounds of the region view
        vis.regionQuakes = vis.regionView.visibleQuakes;

        vis.updateAll();
    }

    // On zoom to sub-continent level
    zoomToLevel2(name) {
        let vis = this;

        // Hide any pie charts that are currently visible
        vis.regionView.hide();

        vis.subContinentSelected = name;
        vis.zoomLevel = 2;

        // Show/hide relevant controls
        hideUnGroupedSwitches(false);
        vis.svg.selectAll('g.colour-legend').remove();
        d3.select('#region-switch input').property('disabled', true);
        d3.select('#region-switch .checkbox-label').classed('disabled', true);
        d3.select('#reset-zoom-button').style('display', 'none');

        vis.regionView = new RegionView(vis.svg, {
            name: vis.subContinentSelected,
            margin: {left: 10, right: 130, top: 10, bottom: 130},
            scaling: subContinentBounds[vis.subContinentSelected],
            countries: vis.countries10m,
            earthquakes: vis.allQuakes,
            plates: vis.plates,
            cities: vis.cities50m,
            showPlateBoundaries: vis.showPlateBoundaries,
            showCities: vis.showCities,
            showMagnitudes: vis.showMagnitudes,
            showYears: vis.showYears,
            cityClickHandler: (name, country, coordinates) => vis.zoomToLevel3(name, country, coordinates),
            allowZoom: true,
            radiusScale: vis.quakeRadiusScale,
        });

        // Retrieve earthquakes that were filtered out by the projection bounds of the region view
        vis.regionQuakes = vis.regionView.visibleQuakes;

        vis.updateAll();
    }

    // On zoom to continent level
    zoomToLevel1(continentName) {
        let vis = this;

        // Hide any pie charts visible from previous continent view and reset continent drop-down
        if (typeof vis.regionView !== 'undefined' && vis.zoomLevel !== 0) {
            vis.regionView.hide();
            d3.select('#sub-continent-select').html('');
        }

        vis.subContinentSelected = undefined;
        vis.continentSelected = continentName;
        vis.zoomLevel = 1;

        vis.globalView.hide();

        // Show/hide relevant controls
        hideExtraControls(false);
        hideUnGroupedSwitches(true);
        d3.select('#region-switch input').property('disabled', false);
        d3.select('#region-switch .checkbox-label').classed('disabled', false);
        d3.select('#reset-zoom-button').style('display', 'none');
        d3.select('#back-button').style('display', 'block');

        vis.regionView = new RegionView(vis.svg, {
            name: vis.continentSelected,
            margin: {left: 10, right: 130, top: 10, bottom: 130},
            scaling: continentBounds[vis.continentSelected],
            countries: vis.countries50m,
            earthquakes: vis.allQuakes,
            plates: vis.plates,
            cities: vis.cities110m,
            showPlateBoundaries: vis.showPlateBoundaries,
            showCities: vis.showCities,
            showMagnitudes: vis.showMagnitudes,
            showYears: vis.showYears,
            cityClickHandler: (name, country, coordinates) => vis.zoomToLevel3(name, country, coordinates),
            allowZoom: false,
            radiusScale: vis.quakeRadiusScale,
            countGroups: magSubContinentCounts[vis.continentSelected],
            pieColourScale: d => vis.colourScale(Math.floor(d)),
            pieClickHandler: name => subContinentClickHandler(vis, name),
            pieCoordinates: subContinentCoordinates[vis.continentSelected],
        })

        // Update the sub-continent drop-down with the correct regions
        d3.select('#sub-continent-select').call(dropdownMenu, {
            optionClass: 'sub-continent-option',
            options: [vis.continentSelected].concat(subContinentMappings[vis.continentSelected]),
            selected: vis.continentSelected,
            labelText: 'Select sub-continent',
            tooltipHTML: '<p>Select a sub-continent to zoom in, or return to continent view.</p>',
            selectHandler: (event) => subContinentSelectedHandler(this, event),
        });

        // Retrieve earthquakes that were filtered out by the projection bounds of the region view
        vis.regionQuakes = vis.regionView.visibleQuakes;

        vis.updateAll();
    }

    // On zoom to global level
    zoomToLevel0() {
        let vis = this;
        // Hide any pie charts visible from a previous continent view
        if (typeof vis.regionView !== 'undefined') {
            vis.regionView.hide();
            d3.select('#sub-continent-select').html('');
        }

        vis.subContinentSelected = undefined;
        vis.continentSelected = undefined;
        vis.zoomLevel = 0;

        // Show/hide relevant controls
        d3.select('#region-switch input').property('disabled', false);
        d3.select('#region-switch .checkbox-label').classed('disabled', false);
        d3.select('#reset-zoom-button').style('display', 'none');
        d3.select('#back-button').style('display', 'none');
        d3.selectAll('.continent-option').property('selected', d => d === 'Global');
        hideExtraControls(true);

        // Re-draw the global view, and re-draw all continent pie charts
        vis.globalView.initVis();

        vis.updateAll();
    }

    // Updates the colours of all components of the visualisation
    updateColours() {
        let vis = this;

        vis.verticalBarChart.updateColours(
            vis.showMagnitudes && !vis.showingRadialGraphs && (vis.zoomLevel >= 2 || (vis.zoomLevel === 1 && !vis.groupByRegion)),
            vis.showingRadialGraphs || (vis.groupByRegion && vis.zoomLevel < 2)
        );
        vis.horizontalBarChart.updateColours(
            vis.showYears && !vis.showingRadialGraphs && (vis.zoomLevel >= 2 || (vis.zoomLevel === 1 && !vis.groupByRegion))
        );

        vis.updateColourLegend((vis.showingRadialGraphs) ? 'horizontal' : 'vertical');
        vis.regionView.updateColours(vis.showYears, vis.showMagnitudes);
    }

    // Update histograms with relevant data depending on the zoom level and grouped/un-grouped view
    updateScales() {
        let vis = this;
        let quakesShown;
        if (vis.showingRadialGraphs) {
            quakesShown = vis.monthView.props.monthQuakes;
        } else if (vis.zoomLevel === 0) {
            quakesShown = vis.allQuakes;
        } else if (vis.groupByRegion && vis.zoomLevel === 1) {
            quakesShown = vis.continentData[vis.continentSelected]
        } else {
            quakesShown = vis.regionQuakes;
        }

        vis.horizontalBarChart.updateVis(quakesShown, vis.magBrushBottom, vis.magBrushTop);
        vis.verticalBarChart.updateVis(quakesShown, vis.yearBrushLeft, vis.yearBrushRight);
    }

    // Update the main view
    updateVis() {
        let vis = this;

        // In month summary view
        if (vis.showingRadialGraphs) {
            vis.monthView.updateVis(
                vis.yearBrushRight, vis.yearBrushLeft, vis.magBrushBottom, vis.magBrushTop,
                vis.radialCommonScale
            );
        // In global view
        } else if (vis.zoomLevel === 0) {
            vis.globalView.updateVis(
                vis.yearBrushRight, vis.yearBrushLeft, vis.magBrushBottom, vis.magBrushTop,
                vis.groupByRegion, vis.showPlateBoundaries
            );
        } else {
            vis.regionView.updateVis(
                vis.yearBrushRight, vis.yearBrushLeft, vis.magBrushBottom, vis.magBrushTop,
                vis.groupByRegion && vis.zoomLevel === 1
            );
        }
    };

    // Re-draw the colour legend to ensure that it is displayed on top of the visualisation
    updateColourLegend(orientation) {
        let vis = this;

        vis.svg.select('g.colour-legend').remove();
        vis.colourLegendGroup = vis.svg.append('g')
            .attr('class', 'colour-legend');

        if ((vis.zoomLevel <= 1 && vis.groupByRegion) || vis.showingRadialGraphs) {
            // In grouped or month views, show a legend for the discretised magnitude scale
            vis.colourLegendGroup
                .attr('transform', `translate(20, ${(orientation === 'vertical') ? 460 : 640})`)
                .call(colourLegend, {
                    colourScale: vis.colourScale,
                    circleRadius: 10,
                    spacing: (orientation === 'vertical') ? 25 : 200,
                    textOffset: 15,
                    boxFixedDimension: (orientation === 'vertical') ? 160 : 40,
                    borderMargin: 20,
                    orientation: orientation,
                    textLabels: d => `Magnitude ${d}-${d+1}`,
                });
        } else if ((vis.zoomLevel >= 2 || (vis.zoomLevel === 1 && !vis.groupByRegion)) && vis.showMagnitudes) {
            // In un-grouped view, show a colour bar for magnitude colour scale
            vis.colourLegendGroup
                .attr('transform', 'translate(380,630)')
                .call(colourBar, {
                    domain: [5.5, 9.5],
                    colourScale: d => d3.interpolateInferno(0.85 - (d - 5) / 6),
                    nTicks: 5,
                    barWidth: 300,
                    barHeight: 20,
                });
        } else if ((vis.zoomLevel >= 2 || (vis.zoomLevel === 1 && !vis.groupByRegion)) && vis.showYears) {
            // In un-grouped view, show a colour bar for year colour scale
            vis.colourLegendGroup
                .attr('transform', 'translate(380,630)')
                .call(colourBar, {
                    domain: [1973, 2023],
                    colourScale: d => d3.interpolateSinebow(0.5 + (d - 1973) / 100),
                    nTicks: 6,
                    barWidth: 300,
                    barHeight: 20,
                });
        } else {
            // Otherwise, hide the legend
            vis.colourLegendGroup.remove();
        }
    }

    // Update all visualisation components in order
    updateAll() {
        let vis = this;
        vis.updateScales();
        vis.updateVis();
        vis.updateColours();
    }
}
