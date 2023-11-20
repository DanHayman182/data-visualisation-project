import { hideUnGroupedSwitches, pieChartToolTip } from '../clickHandlers.js';
import { PieChart } from '../components/pieChart.js';

export class RegionView {
    pieCharts = {};
    constructor(_parent, _props) {
        this.parent = _parent;
        this.props = _props;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.tooltipPadding = 10;
        vis.playingAnimation = false;
        vis.pausedAnimation = false;
        vis.scale = 1;
        vis.quakesDrawn = false;

        const width = +vis.parent.attr('width');
        const height = +vis.parent.attr('height');
        const innerwidth = width - vis.props.margin.left - vis.props.margin.right;
        const innerheight = height - vis.props.margin.top - vis.props.margin.bottom;

        // Define projection by center coordinates and scale, and clip paths to the display region
        vis.projection = d3.geoMercator()
            .center([vis.props.scaling.centerX, vis.props.scaling.centerY])
            .scale(vis.props.scaling.scale)
            .clipExtent([[vis.props.margin.left, vis.props.margin.top], [innerwidth, innerheight]]);

        const pathGenerator = d3.geoPath().projection(vis.projection);

        // Compute the coordinates visible on the screen
        const topLeft = vis.projection.invert([vis.props.margin.left, vis.props.margin.top]);
        const bottomRight = vis.projection.invert([innerwidth, innerheight]);

        // Handle cases where center coordinate is on the right edge of the projection so coordinates wrap-around
        if (bottomRight[0] < topLeft[0]) bottomRight[0] = 180;

        // Filter earthquakes and capital cities to remove items that would be off the screen
        vis.visibleQuakes = vis.props.earthquakes.filter(d => d.longitude >= topLeft[0]
            && d.longitude <= bottomRight[0] && d.latitude <= topLeft[1] && d.latitude >= bottomRight[1]);
        vis.totalQuakes = vis.visibleQuakes.length;

        const citiesToShow = vis.props.cities.features.filter(d =>
            d.geometry.coordinates[0] >= topLeft[0] && d.geometry.coordinates[0] <= bottomRight[0]
            && d.geometry.coordinates[1] <= topLeft[1] && d.geometry.coordinates[1] >= bottomRight[1]
        );

        // Group for whole view
        vis.outerGroup = vis.parent.append('g')
            .attr('class', 'map-group');

        // Group for elements that are zoom-able
        vis.g = vis.outerGroup.append('g')
            .attr('class', 'zoom-able');

        // Append a blank rectangle behind the map to capture all mouse-events for zooming
        vis.g.append('rect')
            .attr('x', vis.props.margin.left)
            .attr('y', vis.props.margin.top)
            .attr('width', innerwidth - vis.props.margin.left)
            .attr('height', innerheight - vis.props.margin.top)
            .attr('class', 'bounding-rect');

        // Paths for countries
        vis.g.selectAll('path.country').data(vis.props.countries.features)
            .enter().append('path')
            .attr('class', 'country')
            .attr('d', d => pathGenerator(d));

        // Map graticule
        vis.g.append('path')
            .attr('class', 'graticule')
            .attr('d', pathGenerator(d3.geoGraticule().step([5, 5]).extent([[-180, -90], [180, 90]])()));

        // If the visualisation is centred on a city, show circles at increasing 50km radii
        if (typeof vis.props.cityCenter !== 'undefined') {
            let circumference = 6371 * 2 * Math.PI, degreeDistance = 0.45218586647,
                angle, textCoordinates, circleGroup;
            for (let i = 1; i <= 5; i++) {
                // Convert distance in km to degrees and compute coordinates of text label
                angle = 360 * 50 * i / circumference;
                textCoordinates = vis.projection(
                    [vis.props.cityCenter.coordinates[0], vis.props.cityCenter.coordinates[1] + i * degreeDistance]);

                circleGroup = vis.g.append('g')
                    .attr('class', 'distance-circle')
                circleGroup.append('path')
                    .attr('d', pathGenerator(d3.geoCircle().center(vis.props.cityCenter.coordinates).radius(angle)()));
                circleGroup.append('text')
                    .attr('transform', 'translate(' + textCoordinates + ')')
                    .attr('dy', '-0.1em')
                    .text(`${50 * i} km`);
            }
        }

        // Paths for plate boundaries, initially hidden
        vis.g.selectAll('path.plates').data(vis.props.plates.features)
            .enter().append('path')
            .attr('class', 'plates')
            .attr('d', d => pathGenerator(d))
            .style('visibility', (vis.props.showPlateBoundaries) ? 'visible' : 'hidden');

        // Symbols for cities (squares from major cities, stars for capital cities)
        vis.star = d3.symbol().type(d3.symbolStar);
        vis.square = d3.symbol().type(d3.symbolSquare);

        // Draw cities, initially hidden
        vis.g.selectAll('path.city').data(citiesToShow)
            .enter().append('path')
            .attr('class', 'city')
            .attr('transform', d => 'translate(' + vis.projection(d.geometry.coordinates) + ')')
            .attr('d', d => (d.properties.capital)
                ? vis.star.size(48 / vis.scale)()
                : vis.square.size(32 / vis.scale)())
            .style('display', 'none')
            .on('mouseover', (event, d) => {
                if (vis.props.showCities) {
                    d3.select(event.target).transition().duration(200)
                        .attr('d', d => (d.properties.capital)
                            ? vis.star.size(80 / vis.scale)()
                            : vis.square.size(64 / vis.scale)())
                        .attr('stroke-width', '0.08em');
                    d3.select('#tooltip').style('display', 'block')
                        .style('left', (event.pageX + vis.tooltipPadding) + 'px')
                        .style('top', (event.pageY + vis.tooltipPadding) + 'px')
                        .html(`
                            <p class="tooltip-title"><b>${d.properties.name}</b></p>
                            <p>${d.properties.country}</p>
                        `);
                }
            })
            .on('mouseleave', (event) => {
                d3.select('#tooltip').style('display', 'none');
                if (vis.props.showCities) {
                    d3.select(event.target).transition().duration(200)
                        .attr('d', d => (d.properties.capital)
                            ? vis.star.size(48 / vis.scale)()
                            : vis.square.size(32 / vis.scale)())
                        .attr('stroke-width', '0.05em');
                }
            })
            .on('click', (event, d) => {
                if (!vis.playingAnimation && !vis.pausedAnimation) {
                    d3.select('#tooltip').style('display', 'none');
                    vis.props.cityClickHandler(
                        d.properties.name, d.properties.country, d.geometry.coordinates
                    );
                }
            });

        // Label indicating number of earthquakes currently shown, outside the zoom-able group
        vis.totalQuakesLabel = vis.outerGroup.append('text')
            .attr('transform', `translate(${innerwidth / 2 - vis.props.margin.left},
                ${innerheight + 1.5 * vis.props.margin.top})`)
            .attr('class', 'quake-count-label')
            .text(vis.textLabel());

        // Remove all paths that were clipped to speed up computation
        vis.g.selectAll('path:not([d])').remove();

        if (vis.props.allowZoom) {
            // If zoom is allowed, adjust the SVG clip-path to the full map area
            vis.clipRect = vis.parent.select('#clip-rect')
                .attr('x', vis.props.margin.left)
                .attr('y', vis.props.margin.top)
                .attr('width', innerwidth - vis.props.margin.left)
                .attr('height', innerheight - vis.props.margin.top)
                .attr('transform', 'scale(1)');

            // Add the SVG clip path to the zoom-able group
            vis.g.attr('clip-path', 'url(#clip-path)');

            // Create the zoom handler, fixed to the size of the map
            vis.zoomHandler = d3.zoom()
                .extent([[vis.props.margin.left, vis.props.margin.top], [innerwidth, innerheight]])
                .translateExtent([[vis.props.margin.left, vis.props.margin.top], [innerwidth, innerheight]])
                .scaleExtent([1, 8])
                .on('zoom', (event) => {
                    // On a zoom, transform the zoom-able group
                    vis.g.attr('transform', event.transform)

                    // Also transform the clip-path rectangle to keep the visible area the same size
                    vis.clipRect
                        .attr('transform', 'scale(' + 1 / event.transform.k + ')')
                        .attr('x', vis.props.margin.left - event.transform.x)
                        .attr('y', vis.props.margin.top - event.transform.y);

                    // If a scale event has occurred, re-draw cities and earthquakes at a different size to keep a
                    //  consistent size of shapes across zoom levels
                    if (vis.scale !== event.transform.k) {
                        vis.scale = event.transform.k;

                        vis.g.selectAll('circle.quake')
                            .attr('r', d => vis.computeRadius(d.mag, 0));
                        vis.g.selectAll('path.city')
                            .attr('d', d => (d.properties.capital)
                                ? vis.star.size(48 / vis.scale)()
                                : vis.square.size(32 / vis.scale)())
                            .style('stroke-width', `${0.05 / Math.pow(vis.scale, 0.6)}em`);
                    }

                    d3.select('#reset-zoom-button').style('display', (vis.scale === 1) ? 'none' : 'block');
                });

            // Add the zoom handler and reset the zoom
            vis.g.call(vis.zoomHandler);
            vis.resetZoom(0);
        }

        // Construct pie charts if in grouped view
        if (typeof vis.props.countGroups !== 'undefined') {
            // Construct a pie chart for each sub-continent
            Object.keys(vis.props.countGroups).forEach(group => {
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
            });
        }
    }

    updateVis(br, bl, bb, bt, groupByRegion) {
        let vis = this;

        // Update plate boundaries and cities depending on whether they should be shown
        vis.g.selectAll('path.plates')
            .style('visibility', vis.props.showPlateBoundaries ? 'visible' : 'hidden');
        vis.g.selectAll('path.city')
            .style('display', vis.props.showCities ? 'block' : 'none');

        // Do not change opacities of earthquakes if animation is playing or paused
        if (vis.playingAnimation || vis.pausedAnimation) return;

        if (groupByRegion) {
            // Delete all earthquake circles if the earthquakes are being grouped by region
            vis.g.selectAll('circle.quake').remove();
            vis.quakesDrawn = false;

            // In grouped view, reset and re-count magnitude counts for the continent sub-continents
            Object.keys(vis.props.countGroups).forEach(group =>
                vis.props.countGroups[group] = {5: 0, 6: 0, 7: 0, 8: 0, 9: 0}
            );
            vis.totalQuakes = 0;

            vis.props.earthquakes.forEach(d => {
                if (d.continent === vis.props.name && d.time.getFullYear() <= br
                        && d.time.getFullYear() >= bl && d.mag <= bt && d.mag >= bb) {
                    vis.props.countGroups[d.sub_continent][Math.floor(d.mag)]++;
                    vis.totalQuakes++;
                }
            });

            // Compute a new scale for pie chart radii based on filtered data, and re-draw pie charts
            vis.radiusScale = d3.scaleSqrt()
                .range([0, 50])
                .domain([0, d3.max(Object.values(vis.props.countGroups),
                    d => d[5] + d[6] + d[7] + d[8] + d[9])]);
            Object.keys(vis.props.countGroups).forEach(group => {
                const total = d3.sum(Object.values(vis.props.countGroups[group]));
                vis.pieCharts[group].props.data = vis.props.countGroups[group];
                vis.pieCharts[group].props.radius = vis.radiusScale(total);
                vis.pieCharts[group].props.display = true;
                vis.pieCharts[group].updateVis(bb, bt);
            });

            hideUnGroupedSwitches(true);
        } else {
            if (typeof vis.props.countGroups !== 'undefined') {
                // In un-grouped view, hide all pie-charts
                Object.keys(vis.props.countGroups).forEach(group => {
                    if (vis.pieCharts[group].props.display) {
                        vis.pieCharts[group].props.display = false;
                        vis.pieCharts[group].updateVis(bb, bt);
                    }
                });
                hideUnGroupedSwitches(false);
            }

            if (!vis.quakesDrawn) {
                vis.quakesDrawn = true
                // Re-create all earthquake circles if they do not currently exist
                vis.g.selectAll('circle.quake').data(vis.visibleQuakes)
                    .enter().append('circle')
                    .attr('class', 'quake')
                    .attr('r', 2 / vis.scale)
                    .attr('transform', d => 'translate(' + vis.projection([d.longitude, d.latitude]) + ')');

                // At high zoom levels, show a tool-tip for each earthquake indicating it's time, magnitude and place
                if (vis.props.allowZoom) {
                    vis.g.selectAll('circle.quake')
                        .on('mouseover', (event, d) => {
                            // If centred on a city, compute distance from earthquake to city, and convert to km
                            let distance;
                            if (typeof vis.props.cityCenter !== 'undefined') {
                                distance = (d3.geoDistance([d.longitude, d.latitude],
                                    vis.props.cityCenter.coordinates) * 6371).toFixed(0);
                            }

                            d3.select(event.target).transition().duration(200)
                                .attr('r', d => vis.computeRadius(d.mag, 2));
                            d3.select('#tooltip').style('display', 'block')
                                .style('left', (event.pageX + vis.tooltipPadding) + 'px')
                                .style('top', (event.pageY + vis.tooltipPadding) + 'px')
                                .html(`
                                    <p class="tooltip-title"><b>Magnitude ${d.mag} earthquake</b></p>
                                    <p>${d.time.toLocaleString('en-GB')}</p>
                                    <p>${d.place}</p>
                                    ${(typeof distance !== 'undefined') ? '<p>' + distance + ' km from ' + 
                                        vis.props.cityCenter.name +'</p>' : ''}
                                `);
                        })
                        .on('mouseleave', (event) => {
                            d3.select('#tooltip').style('display', 'none');
                            d3.select(event.target).transition().duration(200)
                                .attr('r', d => vis.computeRadius(d.mag, 0));
                        });
                }
            }

            // Determine visibility of earthquakes depending on whether they meet brush filtering
            vis.totalQuakes = 0;
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

        // Re-count number of earthquakes shown to update the label
        vis.totalQuakesLabel.text(vis.textLabel());
    }

    updateColours(years, magnitudes) {
        let vis = this;

        vis.props.showYears = years;
        vis.props.showMagnitudes = magnitudes;

        if (vis.quakesDrawn) {
            // Colour earthquakes using the Inferno scale for magnitude, if colour by magnitude is selected
            if (vis.props.showMagnitudes) {
                vis.g.selectAll('circle.quake')
                    .attr('fill', d => d3.interpolateInferno(0.85 - (d.mag - 5) / 6))
                    .attr('r', d => vis.props.radiusScale(d.mag) / vis.scale);
                // Colour earthquakes using the Sinebow scale by year, if colour by year is selected
            } else if (vis.props.showYears) {
                vis.g.selectAll('circle.quake')
                    .attr('fill', d => d3.interpolateSinebow(0.5 + (+d.time.getFullYear() - 1973) / 100))
                    .attr('r', 3 / vis.scale);
                // Otherwise, colour all circles black
            } else {
                vis.g.selectAll('circle.quake')
                    .attr('fill', 'black')
                    .attr('r', 2 / vis.scale);
            }
        }
    }

    // Compute radius of circle depending on zoom and colouring
    computeRadius(value, offset) {
        let vis = this;

        // If colouring by magnitude, use the radius scale otherwise all dots have the same radius
        if (vis.props.showMagnitudes) {
            return (vis.props.radiusScale(value) + offset) / vis.scale;
        } else if (vis.props.showYears) {
            return (3 + offset) / vis.scale;
        } else {
            return (2 + offset) / vis.scale;
        }
    }

    // Determine text for the label at the bottom of the view
    textLabel() {
        let vis = this;
        return `
            ${vis.props.name} - 
            showing ${vis.totalQuakes.toLocaleString('en-GB')} earthquake${(vis.totalQuakes !== 1) ? 's' : ''}
            ${(vis.props.allowZoom) ? ' - scroll to zoom in' : ''}
        `;
    }

    animationControl(br, bl, bb, bt) {
        let vis = this;

        // Pause if animation is already playing
        if (vis.playingAnimation) {
            clearInterval(vis.animationTimer);

            vis.pausedAnimation = true;
            vis.playingAnimation = false;
            d3.select('button.play-through').text('\u25B6 Resume');
        } else {
            // If animation was paused, continue it, otherwise start from beginning
            if (!vis.pausedAnimation) {
                vis.animationYear = 1973;
                vis.disableControls(true);
            }

            vis.playingAnimation = true;
            vis.pausedAnimation = false;
            d3.select('button.play-through').text('\u23F8 Pause');

            // Set an interval timer for the animation to re-draw earthquakes by year
            vis.animationTimer = setInterval(() => {
                if (vis.animationYear > 2023) {
                    // At the end of the animation, re-draw all earthquakes, and enable controls
                    clearInterval(vis.animationTimer);
                    vis.disableControls(false);

                    vis.playingAnimation = false;
                    d3.select('button.play-through').text('\u25B6 Animate Years \u24D8');
                    d3.select('label.play-through').text(`Year: All`);
                    vis.g.selectAll('circle.quake')
                        .attr('r', d => vis.computeRadius(d.mag, 1));

                    vis.updateVis(br, bl, bb, bt, false);
                } else {
                    // During the animation, draw earthquakes for the given year
                    d3.select('label.play-through').text(`Year: ${vis.animationYear}`);
                    vis.redrawYear(vis.animationYear, bb, bt);
                    vis.animationYear++;
                }
            }, 200);
        }
    }

    // Draw earthquakes for the currently shown year and apply the magnitude filter
    redrawYear(year, bb, bt) {
        let vis = this;
        vis.g.selectAll('circle.quake')
            .attr('r', d => vis.computeRadius(d.mag, 1))
            .style('visibility', d => (
                d.time.getFullYear() <= year + 1 && d.time.getFullYear() >= year && d.mag <= bt && d.mag >= bb)
                ? 'visible' : 'hidden'
            );
    }

    // Disable controls while animation is playing, and prevent clicks on cities
    disableControls(value) {
        let vis = this;

        d3.select('#region-switch input').property('disabled', value);
        d3.select('#region-switch .checkbox-label').classed('disabled', value);
        d3.select('#radial-button').style('display', (value) ? 'none' :'block');
        d3.select('#back-button').style('display', (value) ? 'none' :'block');
        d3.selectAll('select').property('disabled', value);
        d3.selectAll('.dropdown-label').classed('disabled', value);
        d3.selectAll('.select-arrow').classed('disabled', value);
        vis.g.selectAll('path.city').style('cursor', (value) ? 'default' : 'pointer');
        vis.totalQuakesLabel.style('display', (value) ? 'none' : 'block');
    }

    resetZoom(duration) {
        let vis = this;

        // Transition to the identity zoom, and reset the clip-path and scale
        vis.g.transition().duration(duration).call(vis.zoomHandler.transform, d3.zoomIdentity);
        vis.clipRect
            .attr('transform', 'scale(1)')
            .attr('x', vis.props.margin.left)
            .attr('y', vis.props.margin.top);
        vis.scale = 1;

        // Re-size all earthquakes and cities
        vis.g.selectAll('circle.quake')
            .attr('r', d => vis.computeRadius(d.mag, 0));
        vis.g.selectAll('path.city')
            .attr('d', d =>
                (d.properties.capital) ? vis.star.size(48)() : vis.square.size(32)())
            .style('stroke-width', '0.05em');

        d3.select('#reset-zoom-button').style('display', 'none');
    }

    // Delete all elements
    hide() {
        let vis = this;

        Object.keys(vis.pieCharts).forEach(pie => {
            vis.pieCharts[pie].hide();
            delete vis.pieCharts[pie];
        });

        vis.outerGroup.remove();
    }
}
