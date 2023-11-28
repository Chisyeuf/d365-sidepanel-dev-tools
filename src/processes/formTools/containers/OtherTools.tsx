import { Stack } from '@mui/material';
import React, {  } from 'react';
import ComponentContainer from '../../../utils/components/ComponentContainer';
import { SubProcessProps } from '../main';
import ShowOptionSetInFields from '../buttons/ShowOptionSetInFields';
import FillFields from '../buttons/FillFields';
import BlurFields from '../buttons/BlurFields';
import CloneRecord from '../buttons/CloneRecord';


const toolList: ((props: SubProcessProps) => JSX.Element)[] = [ShowOptionSetInFields, FillFields, CloneRecord, BlurFields];

function OtherTools(props: SubProcessProps) {

    return (
        <ComponentContainer
            width='100%'
        >
            <Stack spacing={1} width='calc(100% - 10px)' padding='5px'>
                {
                    toolList.map((Tool, index) => {
                        return (<Tool
                            currentFormContext={props.currentFormContext}
                            domUpdated={props.domUpdated}
                        />);
                    })
                }
            </Stack>
        </ComponentContainer>
    );
}

export default OtherTools;