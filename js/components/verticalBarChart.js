export class VerticalBarChart {
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

        // The x-axis is a histogram so use a band scale (for magnitude here)
        vis.xScale = d3.scaleBand()
            .range([innerheight, 0])
            .domain(vis.props.data.map(d => vis.props.xValue(d)))
            .padding(0.1);

        // Append the x-axis to the right of the graph, and show a tick every 0.5 magnitude units, formatted to 1 d.p.
        const xAxis = d3.axisRight(vis.xScale)
            .tickValues(vis.xScale.domain().filter((d, i) => !(i % 5)))
            .tickFormat(d => d.toFixed(1))
            .tickSizeOuter(0);

        // The y-axis is a linear scale with approximately 4 tick marks
        vis.yScale = d3.scaleLinear()
            .domain([0, d3.max(vis.props.data, d => vis.props.yValue(d))])
            .range([ vis.props.chartWidth, 0 ])
            .nice();

        vis.yAxis = d3.axisBottom(vis.yScale).ticks(4).tickSizeOuter(0);

        // Append a vertical brush to the histogram
        vis.brush = d3.brushY()
            .extent([[innerwidth + vis.props.margin.left - vis.props.chartWidth, vis.props.margin.top],
                [innerwidth + vis.props.margin.left, vis.props.margin.top + innerheight]])
            .on('start', () => {
                vis.brushTopLabel.text('');
                vis.brushBottomLabel.text('');
                vis.barsEnter.merge(vis.bars)
                    .style('opacity', 1);
            })
            .on('end', e => vis.brushHandler(e));

        // Add a group for the chart
        vis.g = vis.parent.append('g')
            .attr('class', 'vertical-bar-chart')
            .attr('transform', `translate(${innerwidth + vis.props.margin.left - vis.props.chartWidth},
                ${vis.props.margin.top})`);

        // Group for x-axis
        vis.g.append('g')
            .attr('transform', `translate(${vis.props.chartWidth}, 0)`)
            .call(xAxis);

        // Group for y-axis
        vis.yAxisG = vis.g.append('g')
            .attr('transform', `translate(0, ${innerheight})`)
            .attr('class', 'vertical-y-axis')
            .call(vis.yAxis);

        // Add a group for the histogram and draw the data bars
        vis.bars = vis.g.selectAll('rect.vertical-bar').data(vis.props.data);
        vis.barsEnter = vis.bars.enter().append('rect')
            .attr('class', 'vertical-bar')
            .attr('y', d => vis.xScale(vis.props.xValue(d)))
            .attr('x', d => vis.yScale(vis.props.yValue(d)))
            .attr('height', vis.xScale.bandwidth())
            .attr('width', d => vis.props.chartWidth - vis.yScale(vis.props.yValue(d)))
            .attr('fill', d => vis.props.groupedColourScale(vis.props.xValue(d)));

        // Group for the brush
        vis.brushG = vis.parent.append('g')
            .attr('class', 'brush-box')
            .call(vis.brush);

        // Labels for the extent of the brush
        vis.brushTopLabel = vis.g.append('text')
            .attr('class', 'brush-label');
        vis.brushBottomLabel = vis.g.append('text')
            .attr('class', 'brush-label');

        // Information label for the x-axis
        vis.g.append('text')
            .attr('class', 'axis-label')
            .attr('x', -innerheight / 2)
            .attr('y', vis.props.chartWidth + vis.props.margin.left + 27)
            .attr('transform', 'rotate(-90)')
            .text(vis.props.xAxisLabel + ' \u24D8')
            .on('mouseover', (event) =>
                d3.select('#tooltip').style('display', 'block')
                    .style('left', (event.pageX + tooltipPadding) + 'px')
                    .style('top', (event.pageY + tooltipPadding) + 'px')
                    .html(`
                        <p>Filter data by ${vis.props.xAxisLabel.toLowerCase()}.</p>
                        <p>Click and drag to select a range of ${vis.props.xAxisLabel.toLowerCase()}s.</p>
                        <p>Click once to clear selection.</p>
                    `)
            )
            .on('mouseleave', () => d3.select('#tooltip').style('display', 'none'));

        // Label for the y-axis
        vis.g.append('text')
            .attr('class', 'axis-label')
            .attr('x', vis.props.chartWidth / 2)
            .attr('y', vis.props.margin.top + innerheight + 42)
            .text('Count');
    }

    updateVis(dataShown, bl, br) {
        let vis = this;

        // Re-count earthquake frequencies by magnitude on the current data, filtering with brushes
        vis.props.data.forEach(d => d.frequency = 0);
        dataShown.forEach(d => {
            if (vis.props.filterField(d) >= bl && vis.props.filterField(d) <= br) {
                vis.props.data[vis.props.indexMap(d)].frequency++;
            }
        })

        // Re-compute and re-draw the vertical axis on the new data
        vis.yScale.domain([0, d3.max(vis.props.data, d => vis.props.yValue(d))]).nice();
        vis.yAxisG.call(vis.yAxis);

        // Re-draw the data bars
        vis.barsEnter.merge(vis.bars)
            .transition().duration(500)
            .attr('x', d => vis.yScale(vis.props.yValue(d)))
            .attr('width', d => vis.props.chartWidth - vis.yScale(vis.props.yValue(d)));
    }

    updateColours(continuousScale, groupedScale) {
        let vis = this;

        if (continuousScale) {
            // Use the magma colour scale when earthquakes are coloured by exact magnitude
            vis.barsEnter.merge(vis.bars)
                .attr('fill', d => vis.props.continuousColourScale(vis.props.xValue(d)));
        } else if (groupedScale) {
            // Use the common colour scale when earthquakes are grouped by magnitude band
            vis.barsEnter.merge(vis.bars)
                .attr('fill', d => vis.props.groupedColourScale(vis.props.xValue(d)));
        } else {
            // Otherwise use a default blue colour
            vis.barsEnter.merge(vis.bars)
                .attr('fill', vis.props.fixedColour);
        }
    }

    brushHandler(event) {
        let vis = this;

        // Compute the brush selection and the range of x-values
        const selection = event.selection;
        const extent = d3.extent(vis.xScale.domain());
        let [brushBottom, brushTop] = extent;

        if (selection) {
            // If a brush has been applied, compute the on-screen coordinates of the x-axis
            const range = vis.xScale.domain().map(vis.xScale).reverse();

            // Determine where the brush selections fall in the x-axis range
            brushTop = +(extent[1] - d3.bisectRight(range, selection[0] - vis.props.margin.top) / 10 + 0.1)
                .toFixed(1);
            brushBottom = +(extent[1] - d3.bisectLeft(range, selection[1] - vis.props.margin.top) / 10 + 0.1)
                .toFixed(1);

            // Transition the brush to completely fill the currently selected bars
            const dx = vis.xScale.bandwidth();
            vis.brushG.transition().call(d3.brushY().move,
                [vis.props.margin.top + vis.xScale(Math.min(brushTop, extent[1])),
                    vis.props.margin.top + vis.xScale(Math.max(brushBottom, extent[0])) + dx]);

            // If a single band is selected, only display one brush label
            if (brushTop === brushBottom) {
                vis.brushBottomLabel
                    .attr('x', -20)
                    .attr('y', vis.xScale(Math.max(brushBottom, extent[0])) + 12)
                    .text(Math.max(brushBottom, extent[0]).toFixed(1));
            } else {
                // Otherwise display both
                vis.brushTopLabel
                    .attr('x', -20)
                    .attr('y', vis.xScale(Math.min(brushTop, extent[1])) + 3)
                    .text(Math.min(brushTop, extent[1]).toFixed(1));
                vis.brushBottomLabel
                    .attr('x', -20)
                    .attr('y', vis.xScale(Math.max(brushBottom, extent[0])) + dx + 4)
                    .text(Math.max(brushBottom, extent[0]).toFixed(1));
            }

            // Attenuate bars outside the selection range
            vis.barsEnter.merge(vis.bars)
                .style('opacity', d =>
                    (vis.props.xValue(d) >= brushBottom && vis.props.xValue(d) <= brushTop) ? 1 : 0.5);
        }

        // Call the external handler to interact with the rest of the visualisation
        vis.props.externalHandler(brushBottom, brushTop);
    }
}
