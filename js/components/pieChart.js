export class PieChart {
    constructor(_parent, _props) {
        this.parent = _parent;
        this.props = _props;
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.tooltipPadding = 15;

        // Group and label for pie chart
        vis.g = vis.parent.append('g')
            .attr('transform', `translate(${vis.props.location})`);

        vis.label = vis.g.append('text')
            .attr('class', 'pie-label')
            .attr('x', 0);
    }

    updateVis(brushBottom, brushTop) {
        let vis = this

        // If the chart is hidden, return immediately
        if (!vis.props.display) {
            vis.g.style('display', 'none');
            return
        }

        // Compute a representation of the data for use in a pie chart
        const pie = d3.pie().value(d => d[1]);
        const processedData = pie(Object.entries(vis.props.data));

        // Sum the data to determine the total number of earthquakes
        const totalCount = Object.values(vis.props.data).reduce((a, b) => a + b, 0);

        // Construct pie charts if they don't already exist, filled with the colour of each segment
        const pies = vis.g.selectAll('path.pie-chart').data(processedData);
        const piesEnter = pies.enter().append('path')
            .attr('class', 'pie-chart')
            .attr('fill', d => vis.props.colourScale(+d.data[0]));

        // Re-draw pie charts on the current data
        piesEnter.merge(pies)
            .attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(vis.props.radius)
            )
            .on('mouseover', () => {
                // Tool-tip shows the exact breakdown of earthquakes in the highlighted month and region by magnitude
                if (vis.props.display) {
                    d3.select('#tooltip').style('display', 'block')
                        .html(vis.props.toolTipText(vis.props.name, vis.props.data, totalCount, brushBottom, brushTop));
                    vis.g.selectAll('path.pie-chart')
                        .transition().duration(300)
                        .style('opacity', 1)
                        .style('stroke-width', '1.5px');
                }
            })
            .on('mousemove', (event) => {
                d3.select('#tooltip')
                    .style('left', (event.pageX + vis.tooltipPadding) + 'px')
                    .style('top', (event.pageY + vis.tooltipPadding) + 'px');
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
                if (vis.props.display) {
                    vis.g.selectAll('path.pie-chart')
                        .transition().duration(300)
                        .style('opacity', 0.9)
                        .style('stroke-width', '1px');
                }
            })
            .on('click', () => {if (vis.props.display) vis.props.clickHandler(vis.props.name)});

        // Re-position text just above pie chart, and display the chart
        vis.label.text(vis.props.name).attr('y', -(vis.props.radius + 8));
        vis.g.style('display', 'block');
    }

    // Delete chart
    hide() {
        let vis = this;
        d3.select('#tooltip').style('display', 'none');
        vis.g.remove();
    }
}
