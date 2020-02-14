import React from 'react';

import { DataProviderRenderProps } from '../DataService';
import { debounce, trends } from '../utils';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import "ag-grid-enterprise";
import { currencyFormatter, PriceCell, ChangePercentCell, ChangeCell, ChartCell } from './templates';

const DEBOUNCE_TIME = 250;
const VOLUME_INITIAL = 100;
const VOLUME_STEP = 100;
const FREQUENCY_INITIAL = 100;
const FREQUENCY_STEP = 100;

enum ControlButtons {
    live,
    optimizedLive,
    liveAll,
    stop
}

const BUTTON_META = {
    [ControlButtons.live]: {
        title: 'Live Prices',
        icon: 'refresh'
    },
    [ControlButtons.optimizedLive]: {
        title: 'Live Prices (outside react)',
        icon: 'refresh'
    },
    [ControlButtons.liveAll]: {
        title: 'Live All Prices',
        icon: 'refresh'
    },
    [ControlButtons.stop]: {
        title: 'Stop',
        icon: 'stop'
    }
};

const COLDEFS = [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 45 },
    { field: 'Category', width: 120 },
    { field: 'Type', width: 100 },
    { field: 'Contract', width: 110 },
    { field: 'Settlement', width: 100 },
    { field: 'Region', width: 110 },
    { field: 'Country', width: 100 },
    { field: 'Open Price', width: 120, filter: 'agNumberColumnFilter', valueFormatter: currencyFormatter },
    { field: 'Price', width: 130, filter: 'agNumberColumnFilter', cellRenderer: 'priceCell', valueFormatter: currencyFormatter },
    { field: 'Change', width: 90, filter: 'agNumberColumnFilter', cellRenderer: 'changeCell', cellClass: 'numeric change', headerClass: 'headerAlignStyle' },
    { field: 'Change(%)', width: 90, filter: 'agNumberColumnFilter', cellRenderer: 'changePercentCell', cellClass: 'numeric change' },
    { field: 'Buy', width: 110, filter: 'agNumberColumnFilter', valueFormatter: currencyFormatter },
    { field: 'Sell', width: 110, filter: 'agNumberColumnFilter', valueFormatter: currencyFormatter },
    { field: 'Spread', width: 110, filter: 'agNumberColumnFilter', valueFormatter: currencyFormatter },
    { field: 'Volume', width: 110, filter: 'agNumberColumnFilter', valueFormatter: currencyFormatter },
    { field: 'High(D)', width: 110, filter: 'agNumberColumnFilter', valueFormatter: currencyFormatter },
    { field: 'Low(D)', width: 110, filter: 'agNumberColumnFilter', valueFormatter: currencyFormatter },
    { field: 'High(Y)', width: 110, filter: 'agNumberColumnFilter', valueFormatter: currencyFormatter },
    { field: 'Low(Y)', width: 110, filter: 'agNumberColumnFilter', valueFormatter: currencyFormatter },
    { field: 'Start(Y)', width: 110, filter: 'agNumberColumnFilter', valueFormatter: currencyFormatter },
    { field: 'Chart', width: 60, cellClass: 'center-text', cellRenderer: 'chartCell' },
    { field: 'IndGrou', width: 100, filter: false },
    { field: 'IndSect', width: 120, filter: false, resizable: true },
    { field: 'IndSubg', width: 100, filter: false },
    { field: 'SecType', width: 90, filter: false },
    { field: 'IssuerN', width: 170, filter: false, resizable: true },
    { field: 'Moodys', width: 60, filter: false },
    { field: 'Fitch', width: 60, filter: false },
    { field: 'DBRS', width: 60, filter: false },
    { field: 'CollatT', width: 90, filter: false },
    { field: 'Curncy', width: 60, filter: false },
    { field: 'Security', width: 120, filter: false },
    { field: 'sector', width: 80, filter: false },
    { field: 'CUSIP', width: 100, filter: false },
    { field: 'Ticker', width: 60, filter: false },
    { field: 'Cpn', width: 80, filter: false },
    { field: 'Maturity', width: 120, filter: false },
    { field: 'KRD_3YR', width: 110, filter: false },
    { field: 'ZV_SPREAD', width: 90, filter: false },
    { field: 'KRD_5YR', width: 50, filter: false },
    { field: 'KRD_1YR', width: 80, filter: false },
    { field: 'IndGrou', width: 100, filter: false },
    { field: 'IndSect', width: 100, filter: false, resizable: true },
    { field: 'IndSubg', width: 100, filter: false },
    { field: 'SecType', width: 90, filter: false },
    { field: 'IssuerN', width: 170, filter: false, resizable: true },
    { field: 'Moodys', width: 60, filter: false },
    { field: 'Fitch', width: 60, filter: false },
    { field: 'DBRS', width: 60, filter: false },
    { field: 'CollatT', width: 90, filter: false },
    { field: 'Curncy', width: 60, filter: false },
    { field: 'Security', width: 120, filter: false },
    { field: 'sector', width: 80, filter: false },
    { field: 'CUSIP', width: 100, filter: false },
    { field: 'Ticker', width: 60, filter: false },
    { field: 'Cpn', width: 80, filter: false },
    { field: 'Maturity', width: 120, filter: false },
    { field: 'KRD_3YR', width: 110, filter: false },
    { field: 'ZV_SPREAD', width: 90, filter: false },
    { field: 'KRD_5YR', width: 50, filter: false },
    { field: 'KRD_1YR', width: 80, filter: false },
    { field: 'IndGrou', width: 100, filter: false },
    { field: 'IndSect', width: 100, filter: false },
    { field: 'IndSubg', width: 100, filter: false },
    { field: 'SecType', width: 90, filter: false },
    { field: 'IssuerN', width: 170, filter: false },
    { field: 'Moodys', width: 60, filter: false },
    { field: 'Fitch', width: 60, filter: false },
    { field: 'DBRS', width: 60, filter: false },
    { field: 'CollatT', width: 90, filter: false },
    { field: 'Curncy', width: 60, filter: false },
    { field: 'Security', width: 120, filter: false },
    { field: 'sector', width: 80, filter: false },
    { field: 'CUSIP', width: 100, filter: false },
    { field: 'Ticker', width: 60, filter: false },
    { field: 'Cpn', width: 80, filter: false },
    { field: 'Maturity', width: 120, filter: false },
    { field: 'KRD_3YR', width: 110, filter: false },
    { field: 'ZV_SPREAD', width: 90, filter: false },
    { field: 'KRD_5YR', width: 50, filter: false },
    { field: 'KRD_1YR', width: 80, filter: false },
    { field: 'IndGrou', width: 100, filter: false },
    { field: 'IndSect', width: 100, filter: false },
    { field: 'IndSubg', width: 100, filter: false },
    { field: 'SecType', width: 90, filter: false },
    { field: 'IssuerN', width: 170, filter: false },
    { field: 'Moodys', width: 60, filter: false },
    { field: 'Fitch', width: 60, filter: false },
    { field: 'DBRS', width: 60, filter: false },
    { field: 'CollatT', width: 90, filter: false },
    { field: 'Curncy', width: 60, filter: false },
    { field: 'Security', width: 120, filter: false },
    { field: 'sector', width: 80, filter: false },
    { field: 'CUSIP', width: 100, filter: false },
    { field: 'Ticker', width: 60, filter: false },
    { field: 'Cpn', width: 80, filter: false }
];

const FRAMEWRKCOMPONENTS = {
    priceCell: PriceCell,
    changeCell: ChangeCell,
    changePercentCell: ChangePercentCell,
    chartCell: ChartCell
};

export interface KendoGridProps extends DataProviderRenderProps { }

export const AgGrid: React.FC<KendoGridProps> = (props: KendoGridProps) => {
    const agGridApiRef = React.useRef<any>(null);
    const volumeRef = React.useRef(VOLUME_INITIAL);
    const frequencyRef = React.useRef(FREQUENCY_INITIAL);
    const [selectedButton, setSelectedButton] = React.useState(ControlButtons.stop);
    const [liveUpdating, setLiveUpdating] = React.useState(false);

    const debouncedDataReset = React.useMemo(
        () => debounce((currentVolume?) => props.onDataReset!(currentVolume), DEBOUNCE_TIME),
        [props.onDataReset]
    );

    React.useEffect(
        () => {
            props.onDataReset!(volumeRef.current);
        },
        []
    );

    const onVolumeChange = React.useCallback(
        (event) => {
            const currentVolume = Math.floor(parseInt(event.target.value) / VOLUME_STEP) * VOLUME_STEP;
            volumeRef.current = currentVolume;
            debouncedDataReset(currentVolume);
        },
        [debouncedDataReset]
    );

    const onFrequencyChange = React.useCallback(
        (event) => {
            frequencyRef.current = Math.floor(parseInt(event.target.value) / FREQUENCY_STEP) * FREQUENCY_STEP;
            debouncedDataReset(volumeRef.current);
        },
        [debouncedDataReset]
    );

    const onSelectClick = React.useCallback(
        (event) => {
            const currentButton = Number(event.currentTarget.name);
            setSelectedButton(currentButton);

            switch (currentButton) {
                case ControlButtons.live:
                    props.onStartLiveUpdate!(frequencyRef.current);
                    setLiveUpdating(true);
                    break;
                case ControlButtons.optimizedLive:
                    props.onStartOptimizedLiveUpdate!(frequencyRef.current, onDataUpdate);
                    setLiveUpdating(true);
                    break;
                case ControlButtons.liveAll:
                    props.onStartLiveUpdateAll!(frequencyRef.current);
                    setLiveUpdating(true);
                    break;
                case ControlButtons.stop:
                    props.onStopLiveUpdate!();
                    setLiveUpdating(false);
                    break;
                default:
            }
        },
        [debouncedDataReset, setLiveUpdating, setSelectedButton]
    );

    const onExcelExport = React.useCallback(
        () => {
            if (agGridApiRef.current) {
                agGridApiRef.current!.exportDataAsExcel();
            }
        },
        []
    );

    const onGridReady = React.useCallback(
        (event) => {
            agGridApiRef.current = event.api;
        },
        []
    );

    const onDataUpdate = React.useCallback(
        (newData) => {
            const api = agGridApiRef.current;

            // updating records ourside react is required for meaningful performance with this product
            api.batchUpdateRowData({update: newData});
        },
        []
    );

    return (
        <>
            <div className={'controls-holder'} style={{ maxWidth: 1350 }}>
                <div className={'switches'}>
                    <div className={'control-item'}>
                        <div style={{ minWidth: 140 }}>
                            <input type={'checkbox'} />
                            &nbsp;Grouped
                        </div>
                    </div>
                    <div className={'fintech-slider control-item'}>
                        <label>
                            Records: {volumeRef.current} <br />
                            <input
                                type="range"
                                min={0}
                                max={10000}
                                defaultValue={volumeRef.current}
                                onChange={onVolumeChange}
                                id="myRange"
                                style={{
                                    opacity: liveUpdating ? 0.4 : 1
                                }}
                            />
                        </label>
                    </div>
                    <div className={'fintech-slider control-item'}>
                        <label>
                            Frequency: {frequencyRef.current} ms <br />
                            <input
                                type={'range'}
                                min={100}
                                max={3000}
                                step={10}
                                defaultValue={frequencyRef.current}
                                onChange={onFrequencyChange}
                                disabled={liveUpdating}
                                style={{
                                    opacity: liveUpdating ? 0.4 : 1
                                }}
                            />
                        </label>
                    </div>
                </div>
                <div className={'control-item fintech-play-controls'}>
                    <div className={'intechsample-btn-group'}>
                        {
                            Object
                                .keys(ControlButtons)
                                .filter(key => typeof ControlButtons[key as any] !== 'number')
                                .map(
                                    (key) => (
                                        <button
                                            style={{
                                                border: selectedButton === Number(key) ? '1px solid red' : '1px solid gray',
                                                width: 200
                                            }}
                                            onClick={onSelectClick}
                                            name={key}
                                        >
                                            {BUTTON_META[key].title}
                                        </button>
                                    )
                                )
                        }
                    </div>
                </div>
            </div>
            <div className={'sample-toolbar'}>
                {
                    selectedButton === ControlButtons.live && (
                        <span>
                            Feeding {volumeRef.current} records every {frequencyRef.current / 1000} sec. {volumeRef.current / 5} records updated.
                        </span>
                    )
                }
                {
                    selectedButton === ControlButtons.liveAll && (
                        <span>
                            Feeding {volumeRef.current} records every {frequencyRef.current / 1000} sec. {volumeRef.current} records updated.
                        </span>
                    )
                }
            </div>
            <div
                className="ag-theme-balham"
                style={{
                    width: 1350,
                    height: 800
                }}
            >
                <button onClick={onExcelExport}>Export to excel</button>
                <AgGridReact
                    enableSorting={true}
                    rowHeight={44}
                    enableColResize={false}
                    rowData={props.data}
                    onGridReady={onGridReady}
                    frameworkComponents={FRAMEWRKCOMPONENTS}
                    columnDefs={COLDEFS}
                    getRowNodeId={(dataItem) => dataItem.ID}
                />
            </div>
        </>
    );
}

AgGrid.displayName = 'AgGrid';
