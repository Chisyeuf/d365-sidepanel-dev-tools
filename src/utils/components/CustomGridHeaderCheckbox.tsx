import * as React from 'react';
import PropTypes from 'prop-types';
import { unstable_composeClasses as composeClasses } from '@mui/utils';
import { DataGridProcessedProps } from '@mui/x-data-grid/models/props/DataGridProps';
import { RetrieveAllRecords } from '../hooks/XrmApi/RetrieveAllRecords';
import { RetrievePrimaryIdAttribute } from '../hooks/XrmApi/RetrievePrimaryIdAttribute';
import { debugLog } from '../global/common';
import { getDataGridUtilityClass, GridColumnHeaderParams, GridHeaderSelectionCheckboxParams, gridRowCountSelector, GridRowId, gridTabIndexColumnHeaderSelector, selectedGridRowsCountSelector, useGridApiContext, useGridRootProps, useGridSelector } from '@mui/x-data-grid';

type OwnerState = { classes: DataGridProcessedProps['classes'] };
type CustomGridHeaderCheckboxProps = {
    selectAllCallback?: () => GridRowId[],
    entityname: string,
    retieveBatchSize?: number
}

const useUtilityClasses = (ownerState: OwnerState) => {
    const { classes } = ownerState;

    const slots = {
        root: ['checkboxInput'],
    };

    return composeClasses(slots, getDataGridUtilityClass, classes);
};

const CustomGridHeaderCheckbox = React.forwardRef<HTMLInputElement, GridColumnHeaderParams & CustomGridHeaderCheckboxProps>(
    function CustomGridHeaderCheckbox(props, ref) {
        const { field, colDef, ...other } = props;
        const [, forceUpdate] = React.useState(false);
        const apiRef = useGridApiContext();
        const rootProps = useGridRootProps();
        const ownerState = { classes: rootProps.classes };
        const classes = useUtilityClasses(ownerState);
        const tabIndexState = useGridSelector(apiRef, gridTabIndexColumnHeaderSelector);
        const currentSelectionSize = useGridSelector(apiRef, selectedGridRowsCountSelector);

        const idAttribute = RetrievePrimaryIdAttribute(props.entityname);

        const [rowsAbleToBeSelected, isFetching] = RetrieveAllRecords(props.entityname, [idAttribute], props.retieveBatchSize);

        const handleHeaderSelectionCheckboxChange = React.useCallback(
            (params: GridHeaderSelectionCheckboxParams) => {
                const rowsToBeSelected = rowsAbleToBeSelected.map((value) => {
                    return value[idAttribute]
                })

                debugLog("handleHeaderSelectionCheckboxChange", rowsToBeSelected);
                
                rowsToBeSelected.forEach(rowToSelect => {
                    apiRef.current.selectRow(rowToSelect, params.value);
                });
            },
            [apiRef, rowsAbleToBeSelected, idAttribute, props.retieveBatchSize],
        );

        const numberRows = useGridSelector(apiRef, gridRowCountSelector);
        const isIndeterminate =
            currentSelectionSize > 0 && currentSelectionSize < numberRows;

        const isChecked = currentSelectionSize > 0;

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const params: GridHeaderSelectionCheckboxParams = {
                value: event.target.checked,
            };
            handleHeaderSelectionCheckboxChange(params);
        };

        const tabIndex = tabIndexState !== null && tabIndexState.field === props.field ? 0 : -1;
        React.useLayoutEffect(() => {
            const element = apiRef.current.getColumnHeaderElement(props.field);
            if (tabIndex === 0 && element) {
                element!.tabIndex = -1;
            }
        }, [tabIndex, apiRef, props.field]);

        const handleKeyDown = React.useCallback(
            (event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === ' ') {
                    handleHeaderSelectionCheckboxChange({
                        value: !isChecked,
                    });
                }
            },
            [apiRef, isChecked],
        );

        const handleSelectionChange = React.useCallback(() => {
            forceUpdate((p) => !p);
        }, []);

        React.useEffect(() => {
            return apiRef.current.subscribeEvent('rowSelectionChange', handleSelectionChange);
        }, [apiRef, handleSelectionChange]);

        const label = apiRef.current.getLocaleText(
            isChecked ? 'checkboxSelectionUnselectAllRows' : 'checkboxSelectionSelectAllRows',
        );

        return (
            <rootProps.slots.baseCheckbox
                ref={ref}
                indeterminate={isIndeterminate}
                checked={isChecked}
                onChange={handleChange}
                className={classes.root}
                inputProps={{ 'aria-label': label }}
                tabIndex={tabIndex}
                onKeyDown={handleKeyDown}
                {...rootProps.slotProps?.baseCheckbox}
                {...other}
                disable={isFetching}
            />
        );
    },
);

CustomGridHeaderCheckbox.propTypes = {
    // ----------------------------- Warning --------------------------------
    // | These PropTypes are generated from the TypeScript type definitions |
    // | To update them edit the TypeScript types and run "yarn proptypes"  |
    // ----------------------------------------------------------------------
    /**
     * The column of the current header component.
     */
    colDef: PropTypes.object.isRequired,
    /**
     * The column field of the column that triggered the event
     */
    field: PropTypes.string.isRequired,
} as any;

export { CustomGridHeaderCheckbox };