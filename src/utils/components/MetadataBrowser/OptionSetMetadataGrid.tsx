import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useContext, useEffect, useMemo, useState } from 'react';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ObjectListGrid from './ObjectListGrid';
import { MetadataContext } from './MetadataContextProvider';
import { metadataGrid_valueToLabel } from './valueGetter';
import { ExploreGrid } from './types';
import { MSType } from '../../types/requestsType';


const tabs = [MSType.Picklist, MSType.MultiSelectPicklist, MSType.State, MSType.Status];


function OptionSetMetadataGridSelector(props: ExploreGrid) {

    const [value, setValue] = useState<string>(tabs[0]);

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    return (
        <>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange} aria-label="lab API tabs example">
                        {tabs.map(tab => <Tab value={tab} label={tab.replace("Microsoft.Dynamics.CRM.", "").replace("AttributeMetadata", "")} />)}

                        {/* <Tab label="Picklist" value={MSType.Picklist} />
                        <Tab label="MultiSelectPicklist" value={MSType.MultiSelectPicklist} />
                        <Tab label="State" value={MSType.State} />
                        <Tab label="Status" value={MSType.Status} /> */}
                    </TabList>
                </Box>
                {tabs.map(tabType => (
                    <TabPanel value={tabType} sx={{ p: 0 }}>
                        <OptionSetMetadataGrid {...props} type={tabType} />
                    </TabPanel>
                ))}

                {/* <TabPanel value={MSType.Picklist}>Item One</TabPanel>
                <TabPanel value={MSType.MultiSelectPicklist}>Item Two</TabPanel>
                <TabPanel value={MSType.State}>Item Three</TabPanel>
                <TabPanel value={MSType.Status}>Item Four</TabPanel> */}
            </TabContext>

        </>
    );
}


interface OptionSetMetadataGridProps {
    type: MSType
    entityName: string
}
function OptionSetMetadataGrid(props: OptionSetMetadataGridProps & ExploreGrid) {
    const { type, entityName, explortFileName, openFrom } = props;

    const { optionsSetsMetadata, retrieveOptionSets, isFetchingComponentMetadata: loading } = useContext(MetadataContext);

    useEffect(() => {
        retrieveOptionSets(entityName, type);
    }, [entityName, retrieveOptionSets, type]);

    const processedOptions = useMemo(() => {
        return optionsSetsMetadata[entityName]?.[type]?.reduce<any[]>((previousValue, currentValue) => {
            const options = currentValue.OptionSet;
            options["LogicalName"] = currentValue.LogicalName;
            return [...previousValue, options];
        }, []);
    }, [entityName, optionsSetsMetadata, type]);


    return (
        <ObjectListGrid
            loading={loading}
            dataList={processedOptions ?? []}
            frontColumns={["LogicalName", 'DisplayName', "Description", "Options", "IsGlobal"]}
            columnLabels={{ "LogicalName": "Attribute LogicalName" }}
            columnWidths={{ "IsGlobal": 70 }}
            columnValueFormatter={{
                "DisplayName": metadataGrid_valueToLabel,
                "Description": metadataGrid_valueToLabel,
                "Options": (value: any) => value.map((option: any) => `${option.Label.UserLocalizedLabel.Label}: ${option.Value}`).join(', ')
            }}
            columnRenderCell={{
                "Options": (params) => {
                    const row = params.row;
                    const options = row.Options;

                    return (
                        <TableContainer key={`tableContainer${row.LogicalName}`}>
                            <Table key={`table_${row.LogicalName}`} size='small' sx={{ width: '100%' }} >

                                <TableHead>
                                    <TableRow>
                                        <TableCell ><b>Name</b></TableCell>
                                        <TableCell align='right'><b>Value</b></TableCell>
                                        {options.some((o: any) => o.State !== undefined && o.State !== null) && <TableCell align='right'><b>State</b></TableCell>}
                                        {options.some((o: any) => o.DefaultStatus !== undefined && o.DefaultStatus !== null) && <TableCell align='right'><b>DefaultStatus</b></TableCell>}
                                        {options.some((o: any) => o.ParentValues && o.ParentValues.length > 0) && <TableCell align='right'><b>ParentValues</b></TableCell>}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {
                                        options.map((o: any) => {
                                            return (
                                                <TableRow >
                                                    <TableCell>{o.Label.UserLocalizedLabel?.Label}</TableCell>
                                                    <TableCell align='right'>{String(o.Value)}</TableCell>
                                                    {o.State !== undefined && o.State !== null && <TableCell align='right'>{String(o.State)}</TableCell>}
                                                    {o.DefaultStatus !== undefined && o.DefaultStatus !== null && <TableCell align='right'>{String(o.DefaultStatus)}</TableCell>}
                                                    {o.ParentValues && o.ParentValues.length > 0 && <TableCell align='right'>{JSON.stringify(o.ParentValues)}</TableCell>}
                                                </TableRow>
                                            )
                                        })
                                    }
                                </TableBody>



                            </Table>
                        </TableContainer>
                    )
                },
            }}
            hideRearColumns
            gridHeight='70vh'
            autoRowHeight
            columnNameText={explortFileName}
            openFrom={openFrom}
        />
    )
}

export default OptionSetMetadataGridSelector;