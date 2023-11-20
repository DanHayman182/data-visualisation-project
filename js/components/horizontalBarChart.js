export class HorizontalBarChart {
    constructor(_parent, _props) {
        this.parent = _parent;
        this.props = _props;
        this.initVis();
    }
    initVis() {
        let vis = this;
        const tooltipPadding = 10;

        const width = +vis.parent.attr('width');
        const height = +vis.parent.attr('height');
        const innerwidth = width - vis.props.margin.left - vis.props.margin.right;
        const innerheight = height - vis.props.margin.top - vis.props.margin.bottom;

        vis.xScale = d3.scaleBand()
            .range([0, innerwidth])
            .domain(vis.props.data.map(d => vis.props.xValue(d)))
            .padding(0.03);

        const ticks = vis.xScale.domain().filter((d, i) => !((i + 3) % 5));
        ticks.push(d3.min(vis.xScale.domain()), d3.max(vis.xScale.domain()));

        // Show a tick every 5 years on the x-axis
        const xAxis = d3.axisBottom(vis.xScale)
            .tickValues(ticks)
            .tickSizeOuter(0);

        vis.yScale = d3.scaleLinear()
            .domain([0, d3.max(vis.props.data, d => vis.props.yValue(d))])
            .range([vis.props.chartHeight, 0])
            .nice();

        // Show approximately 4 ticks on the y-axis
        vis.yAxis = d3.axisLeft(vis.yScale).ticks(4).tickSizeOuter(0);

        // Add a brush to the bar chart
        vis.brush = d3.brushX()
            .extent([[vis.props.margin.left, innerheight - vis.props.chartHeight],
                [vis.props.margin.left + innerwidth, innerheight]])
            .on('start', () => {
                // Hide brush labels and reset attenuation on brush start
                vis.brushLeftLabel.text('');
                vis.brushRightLabel.text('');
                vis.barsEnter.merge(vis.bars)
                    .style('opacity', 1);
            })
            .on('end', e => vis.brushHandler(e));

        // Group for the bar chart
        const g = vis.parent.append('g')
            .attr('class', 'horizontal-bar-chart')
            .attr('transform', `translate(${vis.props.margin.left}, ${innerheight - vis.props.chartHeight})`);

        // x-axis group
        g.append('g')
            .attr('transform', `translate(0, ${vis.props.chartHeight})`)
            .call(xAxis);

        // y-axis group
        vis.yAxisG = g.append('g');
        vis.yAxisG.call(vis.yAxis);

        // Draw the data bars
        vis.bars = g.selectAll('rect.bars').data(vis.props.data);
        vis.barsEnter = vis.bars.enter().append('rect')
            .attr('x', d => vis.xScale(vis.props.xValue(d)))
            .attr('y', d => vis.yScale(vis.props.yValue(d)))
            .attr('width', vis.xScale.bandwidth())
            .attr('height', d => vis.props.chartHeight - vis.yScale(vis.props.yValue(d)))
            .attr('fill', vis.props.fixedColour);

        // Add a group for the brush and apply the brush
        vis.brushG = vis.parent.append('g')
            .attr('class', 'brush-box')
            .call(vis.brush);

        // Labels for the left and right edges of the brush
        vis.brushLeftLabel = g.append('text')
            .attr('class', 'brush-label');
        vis.brushRightLabel = g.append('text')
            .attr('class', 'brush-label');

        // Label for the x-axis that displays information on hover
        g.append('text')
            .attr('class', 'axis-label')
            .attr('x', innerwidth / 2)
            .attr('y', vis.props.chartHeight + vis.props.margin.top + 18)
            .text(vis.props.xAxisLabel + ' \u24D8')
            .on('mouseover', (event) => {
                d3.select('#tooltip').style('display', 'block')
                    .style('left', (event.pageX + tooltipPadding) + 'px')
                    .style('top', (event.pageY - 7 * tooltipPadding) + 'px')
                    .html(`
                        <p>Filter data by ${vis.props.xAxisLabel.toLowerCase()}.</p>
                        <p>Click and drag to select a range of ${vis.props.xAxisLabel.toLowerCase()}s.</p>
                        <p>Click once to clear selection.</p>
                    `);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            });

        // Label for the y-axis
        g.append('text')
            .attr('class', 'axis-label')
            .attr('x', -vis.props.chartHeight / 2)
            .attr('y', -vis.props.margin.left / 2 - 10)
            .attr('transform', 'rotate(-90)')
            .text('Count');
    }

    updateVis(dataShown, bb, bt) {
        let vis = this;

        // Re-count earthquake frequencies by year on the current data, filtering with brushes
        vis.props.data.forEach(d => d.frequency = 0);
        dataShown.forEach(d => {
            if (vis.props.filterField(d) >= bb && vis.props.filterField(d) <= bt) {
                vis.props.data[vis.props.indexMap(d)].frequency++;
            }
        })

        // Re-draw y-axis with an updated scale
        vis.yScale.domain([0, d3.max(vis.props.data, d => vis.props.yValue(d))]).nice();
        vis.yAxisG.call(vis.yAxis);

        // Re-draw bars on new data
        vis.barsEnter.merge(vis.bars)
            .transition().duration(500)
            .attr('y', d => vis.yScale(vis.props.yValue(d)))
            .attr('height', d => vis.props.chartHeight - vis.yScale(vis.props.yValue(d)));
    }

    updateColours(continuousScale) {
        let vis = this;

        // If individual earthquakes are being coloured by year, colour bars using the Sinebow colour scale
        if (continuousScale) {
            vis.barsEnter.merge(vis.bars)
                .attr('fill', d => vis.props.continuousColourScale(vis.props.xValue(d)));
        } else {
            // Otherwise colour blue
            vis.barsEnter.merge(vis.bars)
                .attr('fill', '#007e6f');
        }
    }

    brushHandler(event) {
        let vis = this;

        // Compute extent of brush selection and set brush bounds to the edge of the x-axis domain
        const selection = event.selection;
        const extent = d3.extent(vis.xScale.domain());
        let [brushLeft, brushRight] = extent;

        // If the brush selection exists, an area has been selected
        if (selection) {
            // Determine coordinates of the x-axis domain, and determine the positions of the brush selection
            //  in the domain
            const range = vis.xScale.domain().map(vis.xScale);
            brushLeft = extent[0] + d3.bisectRight(range, selection[0] - vis.props.margin.left) - 1;
            brushRight = extent[0] + d3.bisectLeft(range, selection[1] - vis.props.margin.left) - 1;

            // Smoothly transition brush to fill the bars surrounding the current selection
            const dx = vis.xScale.bandwidth();
            vis.brushG.transition().duration(200).call(d3.brushX().move,
                [vis.props.margin.left + vis.xScale(Math.max(brushLeft, extent[0])),
                    vis.props.margin.left + vis.xScale(Math.min(brushRight, extent[1])) + dx]);

            // If the brush is on a single year, only show a single brush label
            if (brushLeft === brushRight) {
                vis.brushLeftLabel
                    .attr('x', vis.xScale(Math.max(brushLeft, extent[0])) - 4)
                    .attr('y', -3)
                    .text(Math.max(brushLeft, extent[0]));
            } else {
                // Otherwise display brushes for each edge of the brush selection
                vis.brushLeftLabel
                    .attr('x', vis.xScale(Math.max(brushLeft, extent[0])) - 18)
                    .attr('y', -3)
                    .text(Math.max(brushLeft, extent[0]));
                vis.brushRightLabel
                    .attr('x', vis.xScale(Math.min(brushRight, extent[1])) + 10)
                    .attr('y', -3)
                    .text(Math.min(brushRight, extent[1]));
            }

            // Attenuate the bars outside the brush selection
            vis.barsEnter.merge(vis.bars)
                .style('opacity', d =>
                    (vis.props.xValue(d) >= brushLeft && vis.props.xValue(d) <= brushRight) ? 1 : 0.5);
        }

        // Call the external brush handler with the computed brush boundaries
        vis.props.externalHandler(brushLeft, brushRight);
    }
}
