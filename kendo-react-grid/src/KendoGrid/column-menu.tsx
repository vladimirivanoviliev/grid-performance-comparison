import React from 'react';
import {
    GridColumnMenuSort,
    GridColumnMenuFilter
} from '@progress/kendo-react-grid';

export const ColumnMenu = (props: any) => {
    return (
        <div>
            <GridColumnMenuSort {...props} />
            <GridColumnMenuFilter {...props} />
        </div>
    );
}