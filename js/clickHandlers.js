// Update histograms and map view on brushing
export const yearBrushHandler = (controller, bl, br) => {
    controller.yearBrushLeft = bl;
    controller.yearBrushRight = br;

    controller.updateScales();
    controller.updateVis();
}

export const magBrushHandler = (controller, bb, bt) => {
    controller.magBrushBottom = bb;
    controller.magBrushTop = bt;

    controller.updateScales();
    controller.updateVis();
}

// Toggle plate boundaries on checkbox use
export const plateBoundarySelector = (controller, event) => {
    controller.showPlateBoundaries = event.target.checked;

    if (controller.zoomLevel === 0) {
        controller.globalView.props.showPlateBoundaries = controller.showPlateBoundaries
        controller.updateVis()
    } else {
        controller.regionView.props.showPlateBoundaries = controller.showPlateBoundaries
        controller.updateVis()
    }
}

// Toggle group-by-region on checkbox use - updates map view, histograms and colours
export const regionGroupSelector = (controller, event) => {
    controller.groupByRegion = event.target.checked;
    controller.updateAll();
}

// Toggle visibility of cities
export const citySelector = (controller, event) => {
    controller.showCities = event.target.checked;
    controller.regionView.props.showCities = controller.showCities;
    controller.updateVis();
}

// Zoom to continent level when clicking on a pie chart - shows selected option on drop-down menu
export const continentClickHandler = (controller, name) => {
    d3.selectAll('.continent-option').property('selected', d => d === name);
    controller.zoomToLevel1(name);
}

// Zoom to sub-continent level when clicking on a pie chart - shows selected option on drop-down menu
export const subContinentClickHandler = (controller, name) => {
    d3.selectAll('.sub-continent-option').property('selected', d => d === name);
    controller.zoomToLevel2(name);
}

// Continent drop-down handler - zoom to either continent view or global view
export const continentSelectedHandler = (controller, event) => {
    if (event.target.value === 'Global' && controller.zoomLevel !== 0) {
        controller.zoomToLevel0();
    } else {
        controller.zoomToLevel1(event.target.value);
    }
}

// Sub-continent drop-down handler - zoom to either sub-continent view or continent view
export const subContinentSelectedHandler = (controller, event) => {
    if (event.target.value === controller.continentSelected && controller.zoomLevel !== 1) {
        controller.zoomToLevel1(controller.continentSelected);
    } else {
        controller.zoomToLevel2(event.target.value);
    }
}

// Colouring by magnitude disables colouring by year and updates colours of all components
export const magnitudeSelector = (controller, event) => {
    controller.showMagnitudes = event.target.checked
    controller.showYears = false;
    d3.select('#year-selector').property('checked', false);

    controller.updateColours();
}

// Colouring by year disables colouring by magnitude and updates colours of all components
export const yearSelector = (controller, event) => {
    controller.showYears = event.target.checked;
    controller.showMagnitudes = false;
    d3.select('#mag-selector').property('checked', false);

    controller.updateColours();
}

// On toggling between custom and aligned scales, update the radial charts
export const updateMonthScales = (controller, event) => {
    controller.radialCommonScale = event.target.checked;

    d3.select('#radial-scale-checkbox .checkbox-label')
        .text(((controller.radialCommonScale) ? 'Common scale' : 'Individual scales') + ' \u24D8');
    controller.updateVis();
}

// The back button zooms out by one-level
export const backButtonHandler = (controller) => {
    if (controller.zoomLevel === 1) {
        controller.zoomToLevel0();
    } else if (controller.zoomLevel === 2) {
        controller.zoomToLevel1(controller.continentSelected)
    } else {
        controller.citySelected = undefined;

        if (typeof controller.subContinentSelected === 'undefined') {
            controller.zoomToLevel1(controller.continentSelected);
        } else {
            controller.zoomToLevel2(controller.subContinentSelected);
        }
    }
}

// Utility function to generate table row for tool-tip
export const pieChartToolTip = (name, data, totalQuakes, magBrushBottom, magBrushTop) => {
    return `
        <p class='tooltip-title'><b>${name}</b></p>
        ${tooltipRows(data, totalQuakes, magBrushBottom, magBrushTop)}
    `;
}

export const radialChartToolTip = (name, subtitle, data, totalCount, magBrushBottom, magBrushTop) => {
    const monthCount = data[5] + data[6] + data[7] + data[8] + data[9];

    return `
        <p class='tooltip-title'><b>${name.split(', ')[0]}</b></p>
        <p>${totalCount.toLocaleString('en-GB')} earthquake${(totalCount !== 1) ? 's' : ''}</p>
        <p class='tooltip-sub-title'><b>${subtitle} - ${(monthCount / totalCount).toLocaleString(
            undefined, {style: 'percent', minimumFractionDigits: 0})}
        </b></p>
        ${tooltipRows(data, monthCount, magBrushBottom, magBrushTop)}
    `;
}

const tooltipRows = (data, count, magBrushBottom, magBrushTop) => {
    let output = `
        <p>${count.toLocaleString('en-GB')} earthquake${(count !== 1) ? 's' : ''}</p>
        <table>
            <tr>
                <th>Mag</th>
                <th colspan="3">Count</th>
            </tr>
    `;
    for (let i = Math.floor(magBrushBottom); i < Math.ceil(magBrushTop + 0.05); i++) {
        output += `
            <tr>
                <td>${Math.max(magBrushBottom, i)} - ${Math.min(magBrushTop, i + 1)}</td>
                <td>${data[i].toLocaleString('en-GB')}</td>
                <td>-</td>
                <td>${(data[i] / count).toLocaleString(undefined,
            {style: 'percent', minimumFractionDigits: 0})}</td>
            </tr>
        `;
    }
    return output + `</table>`;
}

// Utility method to control visibility of controls available at higher zoom levels
export const hideExtraControls = (value) => {
    d3.select('#city-switch input').property('disabled', value);
    d3.select('#city-switch .checkbox-label').classed('disabled', value);
    hideUnGroupedSwitches(value);
}

// Utility methods to control visibility of controls available in un-grouped view
export const hideUnGroupedSwitches = (value) => {
    d3.select('#mag-switch input').property('disabled', value);
    d3.select('#mag-switch .checkbox-label').classed('disabled', value);
    d3.select('#year-switch input').property('disabled', value);
    d3.select('#year-switch .checkbox-label').classed('disabled', value);
    d3.select('#play-through button').property('disabled', value);
    d3.select('#play-through label').classed('disabled', value);
}
