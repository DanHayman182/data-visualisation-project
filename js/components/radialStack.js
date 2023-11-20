export class RadialStack {
    constructor(_parent, _props) {
        this.parent = _parent;
        this.props = _props;
        this.initVis();
    }
    initVis() {
        let vis = this;
        vis.tooltipPadding = 15;

        // Group for chart
        vis.g = vis.parent.append('g')
            .attr('transform', `translate(${vis.props.location})`);

        // Group for the bars
        vis.radialBarGroup = vis.g.append('g')
            .attr('class', 'radial-bars-group');

        // x scale maps domain into an angle in [0, 2pi]
        vis.props.xScale = d3.scaleBand()
            .domain(vis.props.xDomain)
            .range([0, 2 * Math.PI]);

        // Group for x-axis
        vis.xAxisG = vis.g.append('g')
            .attr('class', 'radial x-axis');

        // For each element of the domain, append a tick line and a label
        vis.xAxis = vis.xAxisG.selectAll('g').data(vis.props.xDomain);
        vis.xAxisEnter = vis.xAxis.enter()
            .append('g')
                .attr('transform', d => `
                    rotate(${(vis.props.xScale(d) * 180 / Math.PI - 90)})
                    translate(${vis.props.innerRadius},0)
                `);
        vis.xAxisEnter.append('line')
            .attr('x2', -5)
            .attr('class', 'radial axis-line');
        vis.xAxisEnter.append('text')
            .attr('transform', d =>
                ((vis.props.xScale(d) + Math.PI / 2) % (2 * Math.PI) < Math.PI)
                    ? 'rotate(90)translate(0,16)'
                    : 'rotate(-90)translate(0,-9)')
            .text(d => vis.props.xAxisLabels[d].charAt(0))

        // Add a group for the y-axis, and a text label for each chart
        vis.yAxisG = vis.g.append('g')
            .attr('class', 'radial y-axis');

        vis.g.append('text')
            .attr('x', 0)
            .attr('y', vis.props.outerRadius + 20)
            .attr('class', 'radial text-label')
            .text(vis.props.name)
    }

    updateVis(brushBottom, brushTop) {
        let vis = this;

        // Count the total number of earthquakes shown
        const totalCount = vis.props.data.reduce((acc, curr) =>
            acc + curr[5] + curr[6] + curr[7] + curr[8] + curr[9], 0);

        // Compute the stacked representation of the data
        const stackedData = d3.stack().keys(vis.props.yDomain)(vis.props.data);

        // If a common y-scale has not been specified, compute a y-scale for this chart
        if (typeof vis.props.yScale === 'undefined') {
            vis.props.yScale = d3.scaleRadial()
                .domain([0, d3.max(vis.props.data, d => d[5] + d[6] + d[7] + d[8] + d[9])])
                .range([vis.props.innerRadius, vis.props.outerRadius])
                .nice();
        }

        // A line generator for the bars
        const arc = d3.arc()
            .innerRadius(d => vis.props.yScale(d[0]))
            .outerRadius(d => vis.props.yScale(d[1]))
            .startAngle(d => vis.props.xScale(vis.props.xValue(d.data)) - vis.props.xScale.bandwidth() / 2)
            .endAngle(d => vis.props.xScale(vis.props.xValue(d.data)) + vis.props.xScale.bandwidth() / 2)
            .padAngle(0.08)
            .padRadius(vis.props.innerRadius);

        // Append a group for the bars of each magnitude ban
        const barsGroup = vis.radialBarGroup.selectAll('g').data(stackedData);
        const barsGroupEnter = barsGroup.enter().append('g')
            .attr('fill', d => vis.props.colourScale(d.key))
            .attr('class', 'radial bars');

        // Add the path for each bar to the group
        const bars = barsGroupEnter.merge(barsGroup).selectAll('path').data(d => d);
        const barsEnter = bars.enter().append('path').attr('class', d =>
            `radial id-${vis.props.secondID(d.data)}-${vis.props.xValue(d.data)}`);
        barsEnter.merge(bars)
            .attr('d', d => arc(d))
            .on('mouseover', (event, d) => {
                // Tool-tip shows the exact breakdown of earthquakes in the highlighted month and region by magnitude
                d3.selectAll(`path.radial.id-${vis.props.secondID(d.data)}-${vis.props.xValue(d.data)}`)
                    .transition().duration(300)
                    .style('stroke-width', '0.08em');
                d3.select('#tooltip').style('display', 'block')
                    .html(vis.props.toolTipText(vis.props.name, vis.props.xAxisLabels[vis.props.xValue(d.data)],
                        d.data, totalCount, brushBottom, brushTop));

            })
            .on('mousemove', (event) => {
                d3.select('#tooltip')
                    .style('left', (event.pageX + vis.tooltipPadding) + 'px')
                    .style('top', (event.pageY + vis.tooltipPadding) + 'px');
            })
            .on('mouseleave', (event, d) => {
                d3.select('#tooltip').style('display', 'none');
                d3.selectAll(`path.radial.id-${vis.props.secondID(d.data)}-${vis.props.xValue(d.data)}`)
                    .transition().duration(300)
                    .style('stroke-width', '0em');
            });

        // Add a groups for each y-axis tick line, and add a circle and text label to each
        const yAxis = vis.yAxisG.selectAll('g').data(vis.props.yScale.ticks(4));
        const yAxisEnter = yAxis.enter().append('g');
        yAxisEnter.append('circle')
            .attr('class', 'radial ticks');
        yAxisEnter.append('text')
            .attr('dy', '0.35em')
            .attr('class', 'radial text-label');

        // Update the text label and circle radius for each non-zero axis tick
        const yAxisGroups = yAxisEnter.merge(yAxis);
        yAxisGroups.select('circle')
            .attr('r', d => vis.props.yScale(d));
        yAxisGroups.select('text')
            .attr('y', d => -vis.props.yScale(d))
            .text(d => (d === 0) ? '' : d);

        // Remove any left-over tick groups (e.g. if the number of tick marks has decreased on update)
        yAxis.exit().remove();
    }

    // Delete the chart
    hide() {
        let vis = this;
        vis.g.remove();
    }
}