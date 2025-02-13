import { Tooltip, Button } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import { SubProcessProps } from '../main';

import { Portal } from '@mui/base';
import { LabelToolsSubProcess } from '../containers/LabelTools';
import { ControlType } from '../../../utils/types/ControlType';

import TurnedInIcon from '@mui/icons-material/TurnedIn';
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import { LogicalNameTypography } from '../../../utils/components/LogicalNameTypography';
import { setStyle } from '../../../utils/global/common';


function ShowFieldLabel(props: SubProcessProps & LabelToolsSubProcess) {

    const { enabled: labelDisplayed, setEnabled: setLabelDisplayed, currentFormContext, domUpdated, copyToClipboard } = props;

    useEffect(() => { }, [domUpdated]);

    useEffect(() => {
        setStyle(document, "fieldLabelSheet", {
            ["div[fieldlogicalname]"]: ["width:100%", "min-width:0"]
        });
    }, []);


    const controls = useMemo(() => {
        if (currentFormContext) {
            const controls: Xrm.Controls.Control[] = currentFormContext.getControl((c) => {
                const type = c.getControlType();
                switch (type) {
                    case ControlType.IFRAME:
                    case ControlType.SUBGRID:
                    case ControlType.WEBRESSOURCE:
                    case ControlType.NOTES:
                    case ControlType.TIMER:
                    case ControlType.KBSEARCH:
                    case ControlType.TIMELINE:
                    case ControlType.QUICKFORM:
                        return false;
                    case ControlType.LOOKUP:
                    case ControlType.STANDARD:
                    case ControlType.OPTIONSET:
                    default:
                        return true;
                }
            });

            return controls;
        }
        else {
            return null;
        }
    }, [currentFormContext]);

    const grids = useMemo(() => {
        if (currentFormContext) {
            const grids: Xrm.Controls.GridControl[] = currentFormContext.getControl((c) => c.getControlType() === ControlType.SUBGRID || c.getControlType().startsWith(ControlType.CUSTOMSUBGRID)) as any;

            return grids;
        }
        else {
            return null;
        }
    }, [currentFormContext]);

    const toggleLabelDisplay = () => {
        setLabelDisplayed((prev) => !prev);
    }

    return (<>
        <Tooltip title='Show Fields & Grids Control LogicalNames' placement='left'>
            <Button
                variant='contained'
                onClick={toggleLabelDisplay}
                startIcon={labelDisplayed ? <TurnedInIcon /> : <TurnedInNotIcon />}
            />
        </Tooltip>
        {
            labelDisplayed  && controls?.map((c) => {
                const controlName = c.getName();
                const controlNodeLabel = document.querySelector<HTMLElement>(`[data-id="${controlName}"] label, [id="${controlName}"] label`);
                const controlNodeParent = controlNodeLabel?.parentElement ?? null;
                let controlNode;
                if (!controlNodeParent?.hasAttribute('fieldlogicalname')) {
                    controlNode = document.createElement('div');
                    controlNode.setAttribute('fieldlogicalname', '');
                    controlNodeLabel && controlNode.append(controlNodeLabel);
                    controlNodeParent?.prepend(controlNode);
                }
                else {
                    controlNode = controlNodeParent;
                }
                return (
                    <Portal container={controlNode}>
                        <LogicalNameTypography label={controlName} onClick={copyToClipboard} />
                    </Portal>
                );
            })
        }
        {
            labelDisplayed && grids?.map((c) => {
                const gridName: string = c.getName();
                const gridNode: Element | null = document.querySelector("#dataSetRoot_" + gridName + " > div:first-child");

                let content;
                if (!gridNode?.lastElementChild?.hasAttribute('gridlogicalname')) {
                    content = document.createElement('div');
                    content.setAttribute('gridlogicalname', '');
                    gridNode?.append(content);
                }
                else {
                    content = gridNode?.lastElementChild;
                }

                return (
                    <Portal container={content}>
                        <LogicalNameTypography label={gridName} onClick={copyToClipboard} />
                    </Portal>
                );
            })
        }
    </>
    );
}

export default ShowFieldLabel;