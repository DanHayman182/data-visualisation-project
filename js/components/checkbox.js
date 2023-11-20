export const checkbox = (parent, props) => {
    const {
        id,
        labelText,
        isChecked,
        tooltipHTML,
        onBoxClicked
    } = props;

    const tooltipPadding = 5;
    let tooltipTimer;

    // Define a label to hold the checkbox
    const outerbox = parent.append('label')
        .attr('class', 'switch');

    // Add a regular checkbox and register the click handler
    outerbox.append('input')
        .attr('type', 'checkbox')
        .attr('id', id)
        .property('checked', isChecked)
        .on('change', onBoxClicked);

    outerbox.append('span')
        .attr('class', 'slider round');

    // Add a label for the checkbox
    const label = parent.append('label')
        .attr('class', 'checkbox-label')
        .attr('for', id)
        .text(labelText + " \u24D8");

    // Add a tool-tip if text is provided
    if (tooltipHTML !== '') {
        label
            .on('mouseover', (event) => {
                // Add a delay to the timer to
                tooltipTimer = setTimeout(() => {
                    d3.select('#tooltip').style('display', 'block')
                        .style('left', (event.pageX + tooltipPadding) + 'px')
                        .style('top', (event.pageY + tooltipPadding) + 'px')
                        .html(tooltipHTML);
                }, 750);
            })
            .on('mouseleave', () => {
                clearTimeout(tooltipTimer);
                d3.select('#tooltip').style('display', 'none');
            });
    }
};
