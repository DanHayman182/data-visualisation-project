export const colourLegend = (parent, props) => {
    const {
        colourScale,
        circleRadius,
        spacing,
        textOffset,
        boxFixedDimension,
        borderMargin,
        orientation,
        textLabels,
    } = props;

    // Extract the domain and it's length from the colourScale
    const domain = colourScale.domain();
    const numItems = domain.length;

    // Add bounding box
    parent.append('rect')
        .attr('class', 'legend-box')
        .attr('width', (orientation === 'vertical') ? boxFixedDimension : 2 * borderMargin + numItems * spacing)
        .attr('height', (orientation === 'vertical') ? 2 * borderMargin + (numItems - 1) * spacing : boxFixedDimension)
        .attr('rx', 15);

    // Add groups for each domain element, containing a coloured circle and a label
    const groups = parent.selectAll('g').data(domain);
    const groupsEnter = groups.enter().append('g')
        .attr('class','legend')
        .attr('transform', (d, i) => (orientation === 'vertical')
            ? `translate(${borderMargin}, ${borderMargin + i * spacing})`
            : `translate(${borderMargin + (i + 0.2) * spacing}, ${borderMargin})`
        )

    groupsEnter.append('circle')
        .attr('fill', colourScale)
        .attr('r', circleRadius);

    groupsEnter.append('text')
        .attr('class', 'legend-label')
        .attr('x', textOffset)
        .text(d => textLabels(d));
}
