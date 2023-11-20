import { PieChart } from '../components/pieChart.js';
import { pieChartToolTip } from '../clickHandlers.js';

export class GlobalView {
    pieCharts = {};

    constructor(_parent, _props) {
        this.parent = _parent;
        this.props = _props;
        this.initVis();
    }
    
    initVis() {
        let vis = this;

        vis.quakesDrawn = false;

        const width = +vis.parent.attr('width');
        const height = +vis.parent.attr('height');
        const innerwidth = width - vis.props.margin.left - vis.props.margin.right;
        const innerheight = height - vis.props.margin.top - vis.props.margin.bottom;

        vis.totalQuakes = vis.props.earthquakes.length;
    
        // Define projection and path generator
        vis.projection = d3.geoNaturalEarth1()
            .fitExtent([[vis.props.margin.left, vis.props.margin.top], [innerwidth, innerheight]], vis.props.countries);
        vis.pathGenerator = d3.geoPath().projection(vis.projection);
    
        // Group for map elements
        vis.g = vis.parent.append('g')
            .attr('class', 'map-group');
    
        // Map graticule
        vis.g.append('path')
            .attr('class', 'graticule')
            .attr('d', vis.pathGenerator(d3.geoGraticule().extent([[-180, -90], [180, 90]])()));
    
        // Paths for countries
        vis.g.selectAll('path.country').data(vis.props.countries.features)
            .enter().append('path')
            .attr('class', 'country')
            .attr('d', d => vis.pathGenerator(d));

        // Paths for tectonic plates
        vis.g.selectAll('path.plates').data(vis.props.plates.features)
            .enter().append('path')
            .attr('class', 'plates')
            .attr('d', d => vis.pathGenerator(d))
            .style('opacity', 0);

        // Earth's border
        vis.g.append('path')
            .attr('class', 'sphere')
            .attr('d', vis.pathGenerator({type: 'Sphere'}));
    
        // Label for total number of earthquakes
        vis.totalQuakesLabel = vis.g.append('text')
            .attr('transform', `translate(${innerwidth / 2 - vis.props.margin.left},
                ${innerheight - vis.props.margin.top})`)
            .attr('class', 'quake-count-label')
            .text(`Showing ${vis.totalQuakes.toLocaleString('en-GB')} 
                earthquake${(vis.totalQuakes === 1) ? '' : 's'}`);

        // Construct or re-draw initial pie charts
        Object.keys(vis.props.countGroups).forEach(group => {
            if (group in vis.pieCharts) {
                vis.pieCharts[group].initVis();
            } else {
                vis.pieCharts[group] = new PieChart(vis.parent, {
                    name: group,
                    location: vis.projection(vis.props.pieCoordinates[group]),
                    radius: undefined,
                    data: undefined,
                    colourScale: d => vis.props.pieColourScale(d),
                    display: true,
                    clickHandler: name => vis.props.pieClickHandler(name),
                    toolTipText: (n, d, tc, mb, mt) => pieChartToolTip(n, d, tc, mb, mt),
                });
            }
        });
    }
    
    updateVis(br, bl, bb, bt, groupByRegion, showPlateBoundaries) {
        let vis = this;

        // Remove all earthquake circles if the data is being grouped by region
        if (groupByRegion) {
            vis.g.selectAll('circle.quake').remove();
            vis.quakesDrawn = false;

            // Re-count data for magnitude counts in each continent after filtering
            Object.keys(vis.props.countGroups).forEach(
                group => vis.props.countGroups[group] = {5: 0, 6: 0, 7: 0, 8: 0, 9: 0});
            vis.totalQuakes = 0;

            vis.props.earthquakes.forEach(d => {
                if (d.time.getFullYear() <= br && d.time.getFullYear() >= bl && d.mag <= bt && d.mag >= bb) {
                    vis.props.countGroups[d.continent][Math.floor(d.mag)]++;
                    vis.totalQuakes++;
                }
            });

            // Compute a new scale for pie chart radii based on filtered data, and re-draw pie charts
            vis.radiusScale = d3.scaleSqrt()
                .range([0, 50])
                .domain([0, d3.max(Object.values(vis.props.countGroups), d => d[5] + d[6] + d[7] + d[8] + d[9])]);
            Object.keys(vis.props.countGroups).forEach(group => {
                const total = d3.sum(Object.values(vis.props.countGroups[group]));
                vis.pieCharts[group].props.data = vis.props.countGroups[group];
                vis.pieCharts[group].props.radius = vis.radiusScale(total);
                vis.pieCharts[group].props.display = true;
                vis.pieCharts[group].updateVis(bb, bt);
            });
        } else {
            // In un-grouped view, hide all pie-charts
            Object.keys(vis.props.countGroups).forEach(group => {
                if (vis.pieCharts[group].props.display) {
                    vis.pieCharts[group].props.display = false;
                    vis.pieCharts[group].updateVis(bb, bt);
                }
            });

            // Otherwise show all circles as black dots
            if (!vis.quakesDrawn) {
                // Draw circles if they are not already drawn
                vis.quakesDrawn = true;
                vis.g.selectAll('circle.quake').data(vis.props.earthquakes)
                    .enter().append('circle')
                    .attr('class', 'quake')
                    .attr('r', 1)
                    .attr('transform', d => 'translate(' + vis.projection([d.longitude, d.latitude]) + ')');
            }

            vis.totalQuakes = 0;
            // Change visibility based on brush filtering and count number of visible data points
            vis.g.selectAll('circle.quake')
                .style('visibility', d => {
                    if (d.time.getFullYear() <= br && d.time.getFullYear() >= bl && d.mag <= bt && d.mag >= bb) {
                        vis.totalQuakes++;
                        return 'visible';
                    } else {
                        return 'hidden';
                    }
                });
        }
    
        // Update total data count label and show plates depending on control toggles
        vis.totalQuakesLabel
            .text(`Showing ${vis.totalQuakes.toLocaleString('en-GB')} 
            earthquake${(vis.totalQuakes !== 1) ? 's' : ''}`);
    
        vis.g.selectAll('path.plates')
            .style('opacity', showPlateBoundaries ? 1 : 0);
    }
    
    hide() {
        let vis = this;

        // Hide all pie charts at global level
        Object.keys(vis.props.countGroups).forEach(group => {
            if (vis.pieCharts[group].props.display) {
                vis.pieCharts[group].props.display = false;
                vis.pieCharts[group].hide();
            }
        });

        // Delete all elements
        vis.g.remove();
    }
}
