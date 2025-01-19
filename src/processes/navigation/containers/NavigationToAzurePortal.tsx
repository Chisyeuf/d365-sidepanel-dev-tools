import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import { AzurePortalIcon } from '../icons';
import { NavigationButton } from '../../../utils/types/NavigationButton';
import { Textfit } from 'react-textfit';

function AzurePortal(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    function handleClick() {
        window.open(`https://portal.azure.com/`, '_blank');
    }
    return (
        <>
            <Tooltip placement='left' title='Azure Portal'>
                <Button
                    variant='outlined'
                    onClick={handleClick}
                    startIcon={<AzurePortalIcon />}
                    sx={{
                        width: '100%',
                        maxWidth: 'calc(100% - 10px)',
                        gap: '0.4em',
                        padding: '5px 10px',
                        justifyContent: 'flex-start',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <Box width='calc(100% - 20px)'>
                        <Textfit mode='single' forceSingleModeWidth={false}>
                            Azure Portal
                        </Textfit>
                    </Box>
                </Button>
            </Tooltip>
            {/* </Stack>
            </ComponentContainer> */}
        </>
    )
}

export default AzurePortal;