export const button = (parent, props) => {
    const {
        className,
        labelText,
        buttonText,
        tooltipHTML,
        onClick
    } = props;

    let tooltipTimer;
    const tooltipPadding = 10;

    // Add a button and register click handler
    const button = parent.append('button')
        .attr('class', className)
        .text(buttonText)
        .on('click', onClick);

    // Add a tool-tip if text is provided
    if (tooltipHTML !== '') {
        button
            .on('mouseover', (event) => {
                // Add a short delay to showing tool-tip
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

    // Add a label for the button
    parent.append('label')
        .attr('class', className)
        .text(labelText)
};
