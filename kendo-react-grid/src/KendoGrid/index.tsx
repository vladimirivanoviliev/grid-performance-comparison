import React from 'react';
import {
    Grid, GridColumn, GridToolbar
} from '@progress/kendo-react-grid';
import { Switch, Slider } from '@progress/kendo-react-inputs';
import { Button, ButtonGroup } from '@progress/kendo-react-buttons';
import { DataProviderRenderProps } from '../DataService';
import { debounce } from '../utils';
import { ColumnMenu } from './column-menu';

import { ExcelExport } from '@progress/kendo-react-excel-export';
import { process } from '@progress/kendo-data-query';
import { ChangeCell, ChangePercentCell, PriceCell, ChartCell } from './templates';

const DEBOUNCE_TIME = 250;
const VOLUME_INITIAL = 100;
const VOLUME_STEP = 100;
const FREQUENCY_INITIAL = 100;
const FREQUENCY_STEP = 100;
const PAGE_SIZE = 25;

enum ControlButtons {
    live,
    liveAll,
    stop
}

const BUTTON_META = {
    [ControlButtons.live]: {
        title: 'Live Prices',
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

export interface KendoGridProps extends DataProviderRenderProps { }

export const KendoGrid: React.FC<KendoGridProps> = (props: KendoGridProps) => {
    const [_, setForceUpdate] = React.useState(false);
    const [dataState, setDataState] = React.useState<any>({
        // NOTE: can be split on different states for better performance and change detection
        group: [],
        sort: [],
        skip: 0,
        take: PAGE_SIZE
    })
    const volumeRef = React.useRef(VOLUME_INITIAL);
    const frequencyRef = React.useRef(FREQUENCY_INITIAL);
    const [selectedButton, setSelectedButton] = React.useState(ControlButtons.stop);
    const [liveUpdating, setLiveUpdating] = React.useState(false);
    const lastSelectedIndexRef = React.useRef<any>(0);
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

    const onDataStateChange = React.useCallback(
        (event) => {
            setDataState(event.data);
        },
        []
    );

    const onGroupedChange = React.useCallback(
        () => {
            if (dataState.group.length > 0) {
                setDataState(prevDataState => ({...prevDataState, group: []}))
            } else {
                setDataState(prevDataState => ({
                    ...prevDataState,
                    group: [{
                        dir: 'desc',
                        field: 'Category'
                    }, {
                        dir: 'desc',
                        field: 'Type'
                    }, {
                        dir: 'desc',
                        field: 'Contract'
                    }]
                }));
            }
        },
        [dataState]
    );

    const onVolumeChange = React.useCallback(
        (event) => {
            // because our slider...
            const currentVolume = Math.floor(event.value / VOLUME_STEP) * VOLUME_STEP;
            volumeRef.current = currentVolume;
            debouncedDataReset(currentVolume);
        },
        [debouncedDataReset]
    );

    const onFrequencyChange = React.useCallback(
        (event) => {
            // because our slider...
            frequencyRef.current = Math.floor(event.value / FREQUENCY_STEP) * FREQUENCY_STEP;
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


    const onHeaderSelectionChange = React.useCallback(
        (event) => {
            const checked = event.syntheticEvent.target.checked;

            props.data!.forEach(item => item.selected = checked);

            setForceUpdate(prevForceState => !prevForceState);
        },
        [props.data, setForceUpdate]
    );

    const onSelectionChange = React.useCallback(
        (event) => {
            event.dataItem.selected = !event.dataItem.selected;

            setForceUpdate(prevForceState => !prevForceState);
        },
        [setForceUpdate]
    );

    const onRowClick = React.useCallback(
        (event) => {
            let last = lastSelectedIndexRef.current;
            const data = props.data!;
            const current = data.findIndex(dataItem => dataItem === event.dataItem);

            if (!event.nativeEvent.shiftKey) {
                lastSelectedIndexRef.current = last = current;
            }

            if (!event.nativeEvent.ctrlKey) {
                data.forEach(item => item.selected = false);
            }
            const select = !event.dataItem.selected;
            for (let i = Math.min(last, current); i <= Math.max(last, current); i++) {
                data[i].selected = select;
            }

            setForceUpdate(prevForceState => !prevForceState);
        },
        [props.data, setForceUpdate]
    );

    const excelExportRef = React.useRef<any>(null);

    const onExcelExport = React.useCallback(
        () => {
            if (excelExportRef.current) {
                excelExportRef.current!.save();
            }
        },
        []
    );

    // console.time('processdata');
    const processedData = process(props.data!, dataState);
    // console.timeEnd('processdata');
    
    return (
        <>
            <div className={'controls-holder'} style={{maxWidth: 1350}}>
                <div className={'switches'}>
                    <div className={'control-item'}>
                        <div style={{minWidth: 140}}>
                            <Switch
                                onChange={onGroupedChange}
                            />
                            &nbsp;Grouped
                        </div>
                    </div>
                    <div className={'fintech-slider control-item'}>
                        <label>
                            Records: {volumeRef.current} <br />
                            <Slider
                                min={0}
                                max={10000}
                                step={VOLUME_STEP}
                                defaultValue={volumeRef.current}
                                onChange={onVolumeChange}
                                disabled={liveUpdating}
                            />
                        </label>
                    </div>
                    <div className={'fintech-slider control-item'}>
                        <label>
                            Frequency: {frequencyRef.current} ms <br />
                        <Slider
                                min={100}
                                max={3000}
                                step={10}
                                defaultValue={frequencyRef.current}
                                onChange={onFrequencyChange}
                                disabled={liveUpdating}
                            />
                        </label>
                    </div>
                </div>
                <div className={'control-item fintech-play-controls'}>
                    <ButtonGroup className={'intechsample-btn-group'}>
                        {
                            Object
                                .keys(ControlButtons)
                                .filter(key => typeof ControlButtons[key as any] !== 'number')
                                .map(
                                    (key) => (
                                        <Button
                                            togglable={true}
                                            selected={selectedButton === Number(key)}
                                            onClick={onSelectClick}
                                            name={key}
                                            icon={BUTTON_META[key].icon}
                                            style={{ width: 200 }}
                                        >
                                            {BUTTON_META[key].title}
                                        </Button>
                                    )
                                )
                        }
                    </ButtonGroup>
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
            <ExcelExport
                data={props.data!}
                ref={excelExportRef}
            >
                <Grid
                    style={{
                        width: 1350,
                        height: 800
                    }}
                    groupable={true}
                    sortable={true}
                    resizable={true}
                    rowHeight={44}
                    selectedField={'selected'}
                    scrollable={'virtual'}
                    columnVirtualization={true}

                    columnMenu={ColumnMenu}

                    {...dataState}
                    total={props.data!.length}
                    data={processedData}

                    onDataStateChange={onDataStateChange}
                    onSelectionChange={onSelectionChange}
                    onHeaderSelectionChange={onHeaderSelectionChange}
                    onRowClick={onRowClick}
                >
                    <GridToolbar>
                        <Button
                            title="Export PDF"
                            icon={'file-excel'}
                            onClick={onExcelExport}
                        >
                            Export to Excel
                        </Button>
                    </GridToolbar>
                    <GridColumn
                        field="selected"
                        width={45}
                        filterable={false}
                        headerSelectionValue={props.data!.findIndex(dataItem => !dataItem.selected) === -1}
                    />
                    <GridColumn field={'Category'} width={120} />
                    <GridColumn field={'Type'} width={100} />
                    <GridColumn field={'Contract'} width={110} />
                    <GridColumn field={'Settlement'} width={100} />
                    <GridColumn field={'Region'} width={110} />
                    <GridColumn field={'Country'} width={100} />
                    <GridColumn field={'Open Price'} width={120} filter={'numeric'} format="{0:c4}" />
                    <GridColumn field={'Price'} width={130} filter={'numeric'} cell={PriceCell} />
                    <GridColumn field={'Change'} width={90} className={'numeric change'} filter={'numeric'} headerClassName={'headerAlignStyle'} cell={ChangeCell} />
                    <GridColumn field={'Change(%)'} width={90} className={'numeric change'} filter={'numeric'}  cell={ChangePercentCell} />
                    <GridColumn field={'Buy'} width={110} filter={'numeric'} format={'{0:c4}'} />
                    <GridColumn field={'Sell'} width={110} filter={'numeric'} format={'{0:c4}'} />
                    <GridColumn field={'Spread'} width={110} filter={'numeric'} format={'{0:c4}'} />
                    <GridColumn field={'Volume'} width={110} filter={'numeric'} format={'{0:c4}'} />
                    <GridColumn field={'High(D)'} width={110} filter={'numeric'} format={'{0:c4}'} />
                    <GridColumn field={'Low(D)'} width={110} filter={'numeric'} format={'{0:c4}'} />
                    <GridColumn field={'High(Y)'} width={110} filter={'numeric'} format={'{0:c4}'} />
                    <GridColumn field={'Low(Y)'} width={110} filter={'numeric'} format={'{0:c4}'} />
                    <GridColumn field={'Start(Y)'} width={110} filter={'numeric'} format={'{0:c4}'} />
                    <GridColumn field={'Chart'} width={60} className={'center-text'} cell={ChartCell} />
                    <GridColumn field={'IndGrou'} width={100} filterable={false} />
                    <GridColumn field={'IndSect'} width={120} filterable={false} resizable={true} />
                    <GridColumn field={'IndSubg'} width={100} filterable={false} />
                    <GridColumn field={'SecType'} width={90} filterable={false} />
                    <GridColumn field={'IssuerN'} width={170} filterable={false} resizable={true} />
                    <GridColumn field={'Moodys'} width={60} filterable={false} />
                    <GridColumn field={'Fitch'} width={60} filterable={false} />
                    <GridColumn field={'DBRS'} width={60} filterable={false} />
                    <GridColumn field={'CollatT'} width={90} filterable={false} />
                    <GridColumn field={'Curncy'} width={60} filterable={false} />
                    <GridColumn field={'Security'} width={120} filterable={false} />
                    <GridColumn field={'sector'} width={80} filterable={false} />
                    <GridColumn field={'CUSIP'} width={100} filterable={false} />
                    <GridColumn field={'Ticker'} width={60} filterable={false} />
                    <GridColumn field={'Cpn'} width={80} filterable={false} />
                    <GridColumn field={'Maturity'} width={120} filterable={false} />
                    <GridColumn field={'KRD_3YR'} width={110} filterable={false} />
                    <GridColumn field={'ZV_SPREAD'} width={90} filterable={false} />
                    <GridColumn field={'KRD_5YR'} width={50} filterable={false} />
                    <GridColumn field={'KRD_1YR'} width={80} filterable={false} />
                    <GridColumn field={'IndGrou'} width={100} filterable={false} />
                    <GridColumn field={'IndSect'} width={100} filterable={false} resizable={true} />
                    <GridColumn field={'IndSubg'} width={100} filterable={false} />
                    <GridColumn field={'SecType'} width={90} filterable={false} />
                    <GridColumn field={'IssuerN'} width={170} filterable={false} resizable={true} />
                    <GridColumn field={'Moodys'} width={60} filterable={false} />
                    <GridColumn field={'Fitch'} width={60} filterable={false} />
                    <GridColumn field={'DBRS'} width={60} filterable={false} />
                    <GridColumn field={'CollatT'} width={90} filterable={false} />
                    <GridColumn field={'Curncy'} width={60} filterable={false} />
                    <GridColumn field={'Security'} width={120} filterable={false} />
                    <GridColumn field={'sector'} width={80} filterable={false} />
                    <GridColumn field={'CUSIP'} width={100} filterable={false} />
                    <GridColumn field={'Ticker'} width={60} filterable={false} />
                    <GridColumn field={'Cpn'} width={80} filterable={false} />
                    <GridColumn field={'Maturity'} width={120} filterable={false} />
                    <GridColumn field={'KRD_3YR'} width={110} filterable={false} />
                    <GridColumn field={'ZV_SPREAD'} width={90} filterable={false} />
                    <GridColumn field={'KRD_5YR'} width={50} filterable={false} />
                    <GridColumn field={'KRD_1YR'} width={80} filterable={false} />
                    <GridColumn field={'IndGrou'} width={100} filterable={false} />
                    <GridColumn field={'IndSect'} width={100} filterable={false} />
                    <GridColumn field={'IndSubg'} width={100} filterable={false} />
                    <GridColumn field={'SecType'} width={90} filterable={false} />
                    <GridColumn field={'IssuerN'} width={170} filterable={false} />
                    <GridColumn field={'Moodys'} width={60} filterable={false} />
                    <GridColumn field={'Fitch'} width={60} filterable={false} />
                    <GridColumn field={'DBRS'} width={60} filterable={false} />
                    <GridColumn field={'CollatT'} width={90} filterable={false} />
                    <GridColumn field={'Curncy'} width={60} filterable={false} />
                    <GridColumn field={'Security'} width={120} filterable={false} />
                    <GridColumn field={'sector'} width={80} filterable={false} />
                    <GridColumn field={'CUSIP'} width={100} filterable={false} />
                    <GridColumn field={'Ticker'} width={60} filterable={false} />
                    <GridColumn field={'Cpn'} width={80} filterable={false} />
                    <GridColumn field={'Maturity'} width={120} filterable={false} />
                    <GridColumn field={'KRD_3YR'} width={110} filterable={false} />
                    <GridColumn field={'ZV_SPREAD'} width={90} filterable={false} />
                    <GridColumn field={'KRD_5YR'} width={50} filterable={false} />
                    <GridColumn field={'KRD_1YR'} width={80} filterable={false} />
                    <GridColumn field={'IndGrou'} width={100} filterable={false} />
                    <GridColumn field={'IndSect'} width={100} filterable={false} />
                    <GridColumn field={'IndSubg'} width={100} filterable={false} />
                    <GridColumn field={'SecType'} width={90} filterable={false} />
                    <GridColumn field={'IssuerN'} width={170} filterable={false} />
                    <GridColumn field={'Moodys'} width={60} filterable={false} />
                    <GridColumn field={'Fitch'} width={60} filterable={false} />
                    <GridColumn field={'DBRS'} width={60} filterable={false} />
                    <GridColumn field={'CollatT'} width={90} filterable={false} />
                    <GridColumn field={'Curncy'} width={60} filterable={false} />
                    <GridColumn field={'Security'} width={120} filterable={false} />
                    <GridColumn field={'sector'} width={80} filterable={false} />
                    <GridColumn field={'CUSIP'} width={100} filterable={false} />
                    <GridColumn field={'Ticker'} width={60} filterable={false} />
                    <GridColumn field={'Cpn'} width={80} filterable={false} />
                </Grid>
            </ExcelExport>
        </>
    );
}

KendoGrid.displayName = 'KendoGrid';
