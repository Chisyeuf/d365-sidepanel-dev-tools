import { forwardRef, useState, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

import EntityMetadataListGrid from '../../utils/components/MetadataBrowser/EntityMetadataListGrid';
import MetadataContextProvider from '../../utils/components/MetadataBrowser/MetadataContextProvider';
import TuneIcon from '@mui/icons-material/Tune';
import Typography from '@mui/material/Typography';
import { GridButtonsContext } from '../../utils/components/MetadataBrowser/ObjectListGrid';

class MetadataBrowserButton extends ProcessButton {
    constructor() {
        super(
            'metadatabrowser',
            'Metadata Browser',
            <TuneIcon />,
            '100%'
        );
        this.process = MetadataBrowserProcess;
        this.description = <>
            <Typography><i>Explore hidden data.</i></Typography>
            <Typography>This tool lets you see all metadata in this environment.</Typography>
            <Typography><i>Not all columns are displayed by default, but they are available.</i></Typography>
        </>
    }
}

const MetadataBrowserProcess = forwardRef<ProcessRef, ProcessProps>(
    function MetadataBrowserProcess(props: ProcessProps, ref) {
        const [openedGridId, setOpenedGridId] = useState('');

        return (
            <MetadataContextProvider>

                <GridButtonsContext.Provider value={{ openedGridId, openGrid: setOpenedGridId }}>
                    <EntityMetadataListGrid />
                </GridButtonsContext.Provider>

            </MetadataContextProvider>
        );
    }
);


const metadataBrowser = new MetadataBrowserButton();
export default metadataBrowser;