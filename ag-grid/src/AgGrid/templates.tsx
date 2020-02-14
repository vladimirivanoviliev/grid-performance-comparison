import React from 'react';
import { trends } from '../utils';

export const classNames = (...args): string => {
    return args
        .filter(arg => arg !== true && !!arg)
        .map((arg: any) => {
            return Array.isArray(arg)
                ? classNames(...arg)
                : typeof arg === 'object'
                    ? Object
                        .keys(arg)
                        .map((key, idx) => arg[idx] || (arg[key] && key) || null)
                        .filter(el => el !== null)
                        .join(' ')
                    : arg;
        })
        .filter(arg => !!arg)
        .join(' ');
};

export function formatNumber(number) {
    // this puts commas into the number eg 1000 goes to 1,000,
    // i pulled this from stack overflow, i have no idea how it works
    return Math.floor(number).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

export function currencyFormatter(params) {
    return '$' + formatNumber(params.value);
}

export function currencyFormaterTemplate(params) {
    return '$' + formatNumber(params);
}

export const PriceCell = (props) => {
    const dataItem = props.data;
    const currentTrends = trends(dataItem);

    return (
        <div className={props.colDef.cellClass}>
            <div className={`fintech-icons ${classNames(currentTrends)}`}>
                <span>{currencyFormaterTemplate(dataItem[props.colDef.field])}</span>
                {
                    currentTrends.positive && (<span className="k-icon k-i-arrow-60-up" />)
                }
                {
                    currentTrends.negative && (<span className="k-icon k-i-arrow-60-down" />)
                }
            </div>
        </div>
    );
}

export const ChangeCell = (props) => {
    const dataItem = props.data;
    const currentTrends = trends(dataItem);

    return (
        <div className={props.colDef.cellClass}>
            <div className={classNames(currentTrends)}>{formatNumber(dataItem[props.colDef.field])}</div>
        </div>
    );
};

export const ChangePercentCell = (props) => {
    const dataItem = props.data;
    const currentTrends = trends(dataItem);

    return (
        <div className={props.colDef.cellClass}>
            <div className={classNames(currentTrends)}>{formatNumber(dataItem[props.colDef.field])}%</div>
        </div>
    );
};

export const ChartCell = (props) => {
    return (
        <div className={props.colDef.cellClass}>
            <button>FSCR</button>
        </div>
    );
};