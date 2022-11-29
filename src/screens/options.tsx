import React, { useEffect, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';

import Processes, { defaultProcessesList, storageListName, StorageProcessList } from '../processes/.list';

import ReactDOM from 'react-dom';

import reportWebVitals from '../reportWebVitals';
import { waitForElm } from '../utils/global/common';
import { Button, Checkbox, Container, IconButton, SvgIconProps } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import '../utils/global/extensions';
import { useStorage } from '../utils/hooks/use/useStorage';


const OptionsScreen: React.FunctionComponent = () => {
    const [processesList, setProcessList] = useStorage<StorageProcessList[]>(storageListName, defaultProcessesList)

    // chrome.storage.onChanged.addListener((changes, namespace) => {
    //     for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    //         console.log(
    //             `Storage key "${key}" in namespace "${namespace}" changed.`,
    //             `Old value was "${oldValue}", new value is "${newValue}".`
    //         );
    //     }
    // });

    return (
        <Container sx={{ width: '1000px', height: '400px', }}>
            <OptionsGrid processList={processesList} setProcessList={setProcessList} />
            <Button onClick={() => { chrome.storage.sync.remove(storageListName); window.close(); }}>Reset</Button>
        </Container>
    )
}


type RowProp = {
    id: string,
    name: string,
    icon: SvgIconProps | null,
    index: number,
    isFirst: boolean,
    isLast: boolean,
    startOnLoad: boolean,
    hidden: boolean,
    expand: boolean,
}
type OptionsGridProps = {
    processList: StorageProcessList[] | null
    setProcessList: (data: StorageProcessList[]) => void
}
const OptionsGrid = (props: OptionsGridProps) => {
    const [currentProcessesList, setCurrentProcessesList] = useState<StorageProcessList[]>(props.processList ?? [])

    const MoveUp = (row: RowProp) => {
        if (row.isFirst) {
            return;
        }
        const arrayCopy = [...currentProcessesList];
        const processPosition = arrayCopy.findIndex(pid => pid.id === row.id);
        [arrayCopy[processPosition - 1], arrayCopy[processPosition]] = [arrayCopy[processPosition], arrayCopy[processPosition - 1]];
        setCurrentProcessesList(arrayCopy);
        props.setProcessList(arrayCopy);
    }
    const MoveDown = (row: RowProp) => {
        if (row.isLast) {
            return;
        }
        const arrayCopy = [...currentProcessesList];
        const processPosition = arrayCopy.findIndex(pid => pid.id === row.id);
        [arrayCopy[processPosition], arrayCopy[processPosition + 1]] = [arrayCopy[processPosition + 1], arrayCopy[processPosition]];
        setCurrentProcessesList(arrayCopy);
        props.setProcessList(arrayCopy);
    }
    const SetStartOnUpdate = (row: RowProp, newValue: boolean) => {
        const arrayCopy = [...currentProcessesList];
        const processPosition = arrayCopy.findIndex(pid => pid.id === row.id);
        arrayCopy[processPosition].startOnLoad = newValue;
        setCurrentProcessesList(arrayCopy);
        props.setProcessList(arrayCopy);
    }
    const SetHidden = (row: RowProp, newValue: boolean) => {
        const arrayCopy = [...currentProcessesList];
        const processPosition = arrayCopy.findIndex(pid => pid.id === row.id);
        arrayCopy[processPosition].hidden = newValue;
        setCurrentProcessesList(arrayCopy);
        props.setProcessList(arrayCopy);
    }
    const SetExpand = (row: RowProp, newValue: boolean) => {
        const arrayCopy = [...currentProcessesList];
        arrayCopy.forEach(process => process.expand = false);
        const processPosition = arrayCopy.findIndex(pid => pid.id === row.id);
        arrayCopy[processPosition].expand = newValue;
        setCurrentProcessesList(arrayCopy);
        props.setProcessList(arrayCopy);
    }

    useEffect(() => {
        setCurrentProcessesList(props.processList ?? [])
    }, [props.processList])


    const rows: RowProp[] = useMemo(() => currentProcessesList.map((pid, index) => {
        const p = Processes.find(p => p.id === pid.id)
        return {
            id: p?.id ?? '',
            name: p?.name ?? '',
            icon: p?.icon ?? null,
            index: index + 1,
            isFirst: index === 0,
            isLast: index === currentProcessesList.length - 1,
            startOnLoad: pid.startOnLoad,
            hidden: pid.hidden,
            expand: pid.expand,
        }
    }), [currentProcessesList])

    const cols: GridColDef[] = [
        {
            field: 'index',
            headerName: 'Order',
            width: 55
        },
        {
            field: 'icon',
            headerName: 'Icon',
            renderCell: (params: GridRenderCellParams<SvgIconProps>) => {
                return (
                    params.value
                )
            },
            width: 50
        },
        {
            field: 'name',
            headerName: 'Name',
            width: 150
        },
        {
            field: 'startOnLoad',
            headerName: 'Start on load',
            renderCell: (params: GridRenderCellParams<boolean>) => {
                return (
                    <Checkbox
                        checked={params.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => SetStartOnUpdate(params.row, checked)}
                    />
                )
            }
        },
        {
            field: 'expand',
            headerName: 'Expand',
            renderCell: (params: GridRenderCellParams<boolean>) => {
                return (
                    <Checkbox
                        disabled={!params.row.startOnLoad}
                        checked={params.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => SetExpand(params.row, checked)}
                    />
                )
            }
        },
        {
            field: 'hidden',
            headerName: 'Hidden',
            renderCell: (params: GridRenderCellParams<boolean>) => {
                return (
                    <Checkbox
                        checked={params.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => SetHidden(params.row, checked)}
                    />
                )
            }
        },
        {
            field: 'moveRow',
            headerName: '',
            renderCell: (params: GridRenderCellParams) => {
                return (
                    <Stack direction='row'>
                        <IconButton onClick={() => MoveUp(params.row)} sx={{ visibility: params.row.isFirst ? 'hidden' : 'visible' }}>
                            <ArrowUpwardIcon />
                        </IconButton>
                        <IconButton onClick={() => MoveDown(params.row)} sx={{ visibility: params.row.isLast ? 'hidden' : 'visible' }}>
                            <ArrowDownwardIcon />
                        </IconButton>
                    </Stack>
                )
            },
            width: 90
        },
    ]

    return (
        <DataGrid
            columns={cols}
            rows={rows}
            hideFooter
        />
    )
}


waitForElm('#root').then((rootDiv) => {
    ReactDOM.render(
        <OptionsScreen />,
        rootDiv
    );
});


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
console.log("Option loaded");
