# Performance Comparison - React Grids

This folder contains four versions of the [Angular FinTech Grid App](https://www.infragistics.com/resources/sample-applications/angular-fintech-grid) example:
- one built with Kendo React
- one built with AgGrid
- one built with Kendo UI for Angular
- original one

## Running projects

### AgGrid React

> The application is [hosted online](https://vladimirivanoviliev.github.io/ag-grid-test/) by us.

1. `cd ag-grid`
1. `npm i`
1. `npm start`

### Kendo React

> The application is [hosted online](https://vladimirivanoviliev.github.io/grid-test/) by us.

1. `cd kendo-react-grid`
1. `npm i`
1. `npm start`

### Infragistics Angular

> The application is [hosted online](https://www.infragistics.com/angular-demos/finjs-sample) by Infragistics.

1. `cd igx-grid`
1. `npm ci`
1. `ng serve --prod`

### Kendo UI for Angular

> The application is [hosted online](https://tsvetomir.github.io/static/1cc4e3e3/) by us.

1. `cd kendo-grid`
1. `npm ci`
1. `ng serve --prod`

## Online hosted examples
- [ag-grid-react](https://vladimirivanoviliev.github.io/ag-grid-test/)
- [kendo-react](https://vladimirivanoviliev.github.io/grid-test/ )
- [kendo-angular](https://tsvetomir.github.io/static/1cc4e3e3/)
- [igx-grid](https://tsvetomir.github.io/static/7017cf22/)

## Test results

**Test machine:**
- turbo boost disabled
- chrome 78 incognito mode
- i7 6700HQ @ 2.6ghz constant
- Quadro M1000 GPU
- Ubuntu 19.10

**Performance test raw data:**
- [Test Data Excel](https://drive.google.com/file/d/1jf-TfsoZlaOk2sWTPL4tTxdBDuTF6v6i/view?usp=sharing)

**Generated JSON data:**
- Check the `results` folder.

**Test results visualization:**
- [Test Data Charts](https://kendo-react-performance-comparison-aggrid.stackblitz.io/)

