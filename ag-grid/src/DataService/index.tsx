import React from 'react';
import { FinancialData } from './local-data/financial-data';

export const updateRandomPrices = (data: any[]): any => {
    // console.time('randomizerandom');

    const newData = data.map(item => ({...item}));

    for (let i = Math.round(Math.random() * 10); i < newData.length; i += Math.round(Math.random() * 10)) {
        randomizeObjectData(newData[i]);
    }

    // console.timeEnd('randomizerandom');

    return newData;
}

export const optimizedUpdateRandomPrices = (data: any[], callback?: any): any => {
    // console.time('randomizerandom');
;
    const newData: any[] = [];

    for (let i = Math.round(Math.random() * 10); i < data.length; i += Math.round(Math.random() * 10)) {
        const newItem = {...data[i]};
        randomizeObjectData(newItem);
        newData.push(newItem);
    }

    // console.timeEnd('randomizerandom');

    if (callback) {
        callback(newData);
    }

    return data;
}

export const updateAllPrices = (data: any[]): any => {
    // console.time('randomizeall');

    const newData = data.map(item => ({...item}));
    for (const dataRow of newData) {
        randomizeObjectData(dataRow);
    }

    // console.timeEnd('randomizeall');
    return newData;
}


export const randomizeObjectData = (dataObj) => {
    const changeP = 'Change(%)';
    const res = generateNewPrice(dataObj.Price);
    dataObj.Change = res.Price - dataObj.Price;
    dataObj.Price = res.Price;
    dataObj[changeP] = res.ChangePercent;
}

export const generateNewPrice = (oldPrice): any => {
    let rnd = Math.random();
    rnd = Math.round(rnd * 100) / 100;
    const volatility = 2;
    let newPrice = 0;
    let changePercent = 2 * volatility * rnd;
    if (changePercent > volatility) {
        changePercent -= (2 * volatility);
    }
    const changeAmount = oldPrice * (changePercent / 100);
    newPrice = oldPrice + changeAmount;
    newPrice = Math.round(newPrice * 100) / 100;
    const result = { Price: 0, ChangePercent: 0 };
    changePercent = Math.round(changePercent * 100) / 100;
    result.Price = newPrice;
    result.ChangePercent = changePercent;

    return result;
}

export interface DataProviderRenderProps {
    data?: any[];
    onDataReset?: (volume: number) => void;
    onStartLiveUpdate?: (frequency?: number) => void;
    onStartOptimizedLiveUpdate?: (frequency?: number, callback?: any) => void;
    onStartLiveUpdateAll?: (frequency?: number) => void;
    onStopLiveUpdate?: () => void;
}

export interface DataProviderProps {
    children: React.ElementType<DataProviderRenderProps>
}

export const DataProvider: any = (props: DataProviderProps) => {
    const [data, setData] = React.useState<any[]>([]);
    const intervalRef = React.useRef<any>(null);

    const onDataReset = React.useCallback(
        (volume: number = 10) => {
            clearInterval(intervalRef.current);

            const financialData: FinancialData = new FinancialData();
            setData([...financialData.generateData(volume)]);
        },
        []
    );

    const onStartLiveUpdate = React.useCallback(
        (interval) => {
            clearInterval(intervalRef.current);

            intervalRef.current = setInterval(
                () => setData(oldData => updateRandomPrices(oldData)),
                interval
            );
        },
        [data]
    );

    const onStartOptimizedLiveUpdate = React.useCallback(
        (interval, callback) => {
            clearInterval(intervalRef.current);

            intervalRef.current = setInterval(
                () => setData(oldData => optimizedUpdateRandomPrices(oldData, callback)),
                interval
            );
        },
        [data]
    );


    const onStartLiveUpdateAll = React.useCallback(
        (interval) => {
            clearInterval(intervalRef.current);

            intervalRef.current = setInterval(
                () => setData(oldData => updateAllPrices(oldData)),
                interval
            );
        },
        [data]
    );

    const onStopLiveUpdate = React.useCallback(
        () => {
            clearInterval(intervalRef.current);
        },
        []
    );

    return React.Children.map(
        props.children,
        (child) => {
            if (!React.isValidElement(child)) {
                return;
            }

            return <child.type
                {...child.props}
                data={data}
                onDataReset={onDataReset}
                onStartLiveUpdate={onStartLiveUpdate}
                onStartLiveUpdateAll={onStartLiveUpdateAll}
                onStopLiveUpdate={onStopLiveUpdate}
                onStartOptimizedLiveUpdate={onStartOptimizedLiveUpdate}
            />;
        }
    );
}
