import { forwardRef, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

import EntityMetadataListGrid from '../../utils/components/MetadataBrowser/EntityMetadataListGrid';
import MetadataContextProvider from '../../utils/components/MetadataBrowser/MetadataContextProvider';
import TuneIcon from '@mui/icons-material/Tune';

class MetadataBrowserButton extends ProcessButton {
    constructor() {
        super(
            'metadatabrowser',
            'Metadata Browser',
            <TuneIcon />,
            '100%'
        );
        this.process = MetadataBrowserProcess;
    }
}

const MetadataBrowserProcess = forwardRef<ProcessRef, ProcessProps>(
    function MetadataBrowserProcess(props: ProcessProps, ref) {
        const { snackbarProvider } = props;

        return (
            <MetadataContextProvider>

                <EntityMetadataListGrid snackbarProvider={snackbarProvider} />

            </MetadataContextProvider>
        );
    }
);


const metadataBrowser = new MetadataBrowserButton();
export default metadataBrowser;