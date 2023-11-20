import { RadialStack } from '../components/radialStack.js';
import { monthsList, radialPlacements, radialRadii } from '../loadAndProcessData.js';
import { radialChartToolTip } from '../clickHandlers.js';

export class MonthView {
    constructor(_parent, _props) {
        this.parent = _parent;
        this.props = _props;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Hide all controls, and display a close button to exit the view
        d3.select('#selection-controls').style('display', 'none');
        d3.select('#radial-button').style('display', 'none');
        d3.select('#back-button').style('display', 'none');
        d3.select('#reset-zoom-button').style('display', 'none');

        d3.select('#close-radial-button').style('display', 'block');

        // Construct radial graphs for each region
        vis.monthRadialGraphs = [];
        for (let i = 0; i < vis.props.monthRegionList.length; i++) {
            vis.monthRadialGraphs[i] = new RadialStack(vis.parent, {
                name: vis.props.monthRegionList[i],
                location: radialPlacements[vis.props.monthRegionList.length][i],
                innerRadius: radialRadii[vis.props.monthRegionList.length][0],
                outerRadius: radialRadii[vis.props.monthRegionList.length][1],
                data: undefined,
                colourScale: vis.props.colourScale,
                xAxisLabels: monthsList,
                xDomain: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                yDomain: [9, 8, 7, 6, 5],
                xValue: d => d.month,
                secondID: d => d.region,
                yScale: undefined,
                toolTipText: (n, s, d, tc, bb, bt) => radialChartToolTip(n, s, d, tc, bb, bt),
            })
        }

        // Append a text label for the total count of earthquakes in the view
        vis.radialLabel = vis.parent.append('text')
            .attr('class', 'quake-count-label')
            .attr('x', 520)
            .attr('y', 625);

        // Show the checkbox to switch between common and individual scales
        if (vis.props.monthRegionList.length > 1) d3.select('#radial-scale-checkbox').style('display', 'flex');
    }

    updateVis(br, bl, bb, bt, commonScale) {
        let vis = this;

        // Reset and re-count the data for the radial stacked bar charts
        let radialData = [], quakeCount = 0;
        for (let i = 0; i < vis.props.monthRegionList.length; i++) {
            radialData[i] = [];
            for (let j = 0; j < 12; j++) {
                radialData[i][j] = {'region': i, 'month': j, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0}
            }
        }

        vis.props.monthQuakes.forEach(d => {
            if (d.time.getFullYear() <= br && d.time.getFullYear() >= bl && d.mag <= bt && d.mag >= bb) {
                radialData[vis.props.monthEarthquakeSelector(d)][d.time.getMonth()][Math.floor(d.mag)]++;
                quakeCount++;
            }
        });

        // Create a common scale for all radial charts based on the maximum across all regions displayed
        const yScale = d3.scaleRadial()
            .domain([0, d3.max(radialData, region => d3.max(region, d => d[5] + d[6] + d[7] + d[8] + d[9]))])
            .range(radialRadii[vis.props.monthRegionList.length])
            .nice();

        // Update the radial charts and total earthquake count label
        for (let i = 0; i < vis.props.monthRegionList.length; i++) {
            vis.monthRadialGraphs[i].props.data = radialData[i];
            vis.monthRadialGraphs[i].props.yScale = (commonScale) ? yScale : undefined;
            vis.monthRadialGraphs[i].updateVis(bb, bt);
        }

        vis.radialLabel
            .text(`Showing ${quakeCount.toLocaleString('en-GB')} earthquake${(quakeCount === 1) ? '' : 's'}`);
    }

    hide() {
        let vis = this;

        for (let i = 0; i < vis.props.monthRegionList.length; i++) {
            vis.monthRadialGraphs[i].hide();
        }

        // Re-enable original controls and visualisations depending on previous view
        d3.select('#selection-controls').style('display', 'grid');
        d3.select('#radial-button').style('display', 'block');
        d3.select('#close-radial-button').style('display', 'none');
        d3.select('#radial-scale-checkbox').style('display', 'none');
        d3.select('#reset-zoom-button').style('display', 'none');

        vis.radialLabel.remove();
    }
}