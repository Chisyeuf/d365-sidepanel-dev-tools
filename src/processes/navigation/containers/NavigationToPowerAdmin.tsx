
import { Box, Button, Tooltip } from '@mui/material';

import { PowerEnvironmentIcon } from '../icons';
import { NavigationButton } from '../../../utils/types/NavigationButton';
import { Textfit } from 'react-textfit';

function PowerAdmin(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    function handleClickEnvironment(e: any) {
        handleClick(e, "/environments");
    }
    function handleClick(e: any, add: string = '') {
        window.open(`https://admin.powerplatform.microsoft.com${add}`, '_blank');
    }

    return (
        <>
            <Tooltip placement='left' title='Admin Power Platform'>
                <Button
                    variant='outlined'
                    onClick={handleClick}
                    startIcon={<img height='20px' src='https://admin.powerplatform.microsoft.com/favicon.ico' />}
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
                            Admin Power Platform
                        </Textfit>
                    </Box>
                </Button>
            </Tooltip>


            <Tooltip placement='left' title='Environments List from Admin Power Platform'>
                <Button
                    variant='outlined'
                    onClick={handleClickEnvironment}
                    startIcon={<PowerEnvironmentIcon />}
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
                            Environments
                        </Textfit>
                    </Box>
                </Button>
            </Tooltip>
        </>
    )
}

export default PowerAdmin;