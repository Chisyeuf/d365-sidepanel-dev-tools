import { forwardRef, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

import EntityMetadataListGrid from '../../utils/components/MetadataBrowser/EntityMetadataListGrid';
import MetadataContextProvider from '../../utils/components/MetadataBrowser/MetadataContextProvider';
import TuneIcon from '@mui/icons-material/Tune';
import Typography from '@mui/material/Typography';

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
            <Typography>This tool lets you see all metadata in this environnment.</Typography>
            <Typography><i>Not all columns are displayed by default but are available.</i></Typography>
        </>
    }
}

const MetadataBrowserProcess = forwardRef<ProcessRef, ProcessProps>(
    function MetadataBrowserProcess(props: ProcessProps, ref) {

        return (
            <MetadataContextProvider>

                <EntityMetadataListGrid />

            </MetadataContextProvider>
        );
    }
);


const metadataBrowser = new MetadataBrowserButton();
export default metadataBrowser;