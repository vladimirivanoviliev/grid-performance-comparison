import { changeNegative, changePositive, negative, positive, strongNegative, strongPositive } from '../DataService/local-data/trends';

export function debounce<F extends Function>(func: F, wait: number): F {
    let timeoutID: number;

    // conversion through any necessary as it wont satisfy criteria otherwise
    return <any>function (this: any, ...args: any[]) {
        clearTimeout(timeoutID);
        const context = this;

        timeoutID = window.setTimeout(function () {
            func.apply(context, args);
        }, wait);
    };
};

export const trends = (dataItem: any) => {
    return {
        changeNegative: changeNegative(dataItem),
        changePositive: changePositive(dataItem),
        negative: negative(dataItem),
        positive: positive(dataItem),
        strongNegative: strongNegative(dataItem),
        strongPositive: strongPositive(dataItem)
    };
};