
import { Button, Tooltip } from '@mui/material';
import React from 'react';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { NavigationButton } from '../../../utils/types/NavigationButton';

function AdvancedFind(props: NavigationButton) {
    const { environmentId, clientUrl } = props;
    

    async function handleClick() {
        const entityName = Xrm.Utility.getPageContext()?.input?.entityName;
        if (entityName) {
            const objectTypeCode = (await Xrm.Utility.getEntityMetadata(entityName)).ObjectTypeCode;
            window.open(`${clientUrl}/main.aspx?extraqs=%3F%26EntityCode%3D${objectTypeCode}&pagetype=AdvancedFind`, '_blank');
        }
        else {
            window.open(`${clientUrl}/main.aspx?pagetype=AdvancedFind`, '_blank');
        }
    }
    return (
        <>
            <Tooltip placement='left' title='Advanced Find Origins'>
                <Button
                    variant='outlined'
                    onClick={handleClick}
                    startIcon={<FilterAltIcon />}
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
                    Advanced Find
                </Button>
            </Tooltip>
            {/* </Stack>
            </ComponentContainer> */}
        </>
    )
}

export default AdvancedFind;