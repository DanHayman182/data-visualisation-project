export const colourBar = (parent, props) => {
    const {
        domain,
        colourScale,
        nTicks,
        barWidth,
        barHeight,
    } = props;

    // Group for colour bar
    const group = parent.append('g')
        .attr('class', 'legend');

    // Rectangle for colour bar
    const legendRect = group.append('rect')
        .attr('width',  barWidth)
        .attr('height', barHeight);

    // Legend labels
    const ticks = Array.from(Array(nTicks).keys())
        .map(d => (domain[0] + (domain[1] - domain[0]) * d / (nTicks - 1)));
    group.selectAll('.bar-label').data(ticks)
        .enter().append('text')
            .attr('class', 'bar-label')
            .attr('x', (d, i) => Math.round(barWidth * i / (nTicks - 1)))
            .attr('y', -5)
            .text(d => Math.round(d * 10) / 10);

    // Add 50 markers across the range of the colour scale
    let domainValue;
    const legendStops = []
    for (let i = 0; i <= 100; i += 2) {
        domainValue = domain[0] + i * (domain[1] - domain[0]) / 100;
        legendStops.push({ color: colourScale(domainValue), value: domainValue, offset: i });
    }

    // Linear gradient to be used for the colour bar
    const linearGradient = parent.append('linearGradient')
        .attr('id', 'legend-gradient');

    // Add stops to the gradient
    linearGradient.selectAll('stop').data(legendStops)
        .enter().append('stop')
            .attr('offset', d => `${d.offset}%`)
            .attr('stop-color', d => d.color);

    // Apply gradient to rectangle
    legendRect.attr('fill', 'url(#legend-gradient)');
}
