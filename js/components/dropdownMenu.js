export const dropdownMenu = (parent, props) => {
    const {
        optionClass,
        options,
        selected,
        labelText,
        tooltipHTML,
        selectHandler
    } = props;

    let tooltipTimer;
    const tooltipPadding = 5;

    // Add a label for the dropdown menu
    const label = parent.append('label')
        .attr('class', 'dropdown-label')
        .text(labelText + " \u24D8:");

    // Add a tool-tip if text is provided
    if (tooltipHTML !== '') {
        label
            .on('mouseover', (event) => {
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

    // Add the selection menu
    const select = parent.append('select')
        .on('change', selectHandler);

    // Append options to the selection menu
    select.selectAll('option').data(options)
        .enter().append('option')
        .attr('class', `selection-option ${optionClass}`)
        .attr('value', d => d)
        .text(d => d)
        .property('selected', d => d === selected);

    // Add a span to hold a down-arrow icon styled with CSS
    parent.append('span')
        .attr('class', 'select-arrow');
};