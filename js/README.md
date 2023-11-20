## Structure of JavaScript files

- `components/` contains implementations of individual visualisation components using D3.js
- `views/` contains controllers for each of the three main views in the visualisation, controlling the components visible in the view
- `loadAndProcessData.js` contains data loaders and global constants
- `clickHandlers.js` contains methods to respond to click events across the visualisation, and some utility methods
- `index.js` calls the data loaders and passes the information to the visualisation controller to begin the visualisation
- `visController.js` is the primary visualisation controller and handles transitions between views and interaction with global controls

## Components

Individual components are either static or dynamic depending on whether they need to update on new data.
- Static components - functions that construct SVG elements that cannot be modified once created (other than deleted)
  - These should be as re-usable and generic as possible - all data passed in the constructor
- Dynamic components - classes that implement the following interface
  - `initVis()` - constructs the component initially
  - `updateVis()` - updates the visualisation on new data based on parameters passed by the view controller
  - `hide()` - removes all elements of the component

## View Controllers

View controllers coordinate all of the components within their current view (not including global controls or histograms), updating them on new data. This is done by passing global state variables to the `updateVis` methods of dynamic components.
