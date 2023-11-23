import { Tooltip, Button } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import { SubProcessProps } from '../main';

import { Portal } from '@mui/base';
import BookIcon from '@mui/icons-material/Book';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import { LabelToolsSubProcess } from '../containers/LabelTools';
import { LogicalNameTypography } from '../../../utils/components/LogicalNameTypography';

function ShowTabLabel(props: SubProcessProps & LabelToolsSubProcess) {

    const { enabled: labelDisplayed, setEnabled: setLabelDisplayed, currentFormContext, domUpdated, copyToClipboard } = props;

    useEffect(() => { }, [domUpdated]);


    const tabs = useMemo(() => {
        if (currentFormContext) {
            const tabs: Xrm.Controls.Tab[] = currentFormContext.ui.tabs?.get();

            return tabs;
        }
        else {
            return null;
        }
    }, [currentFormContext]);

    const sections = useMemo(() => {
        if (currentFormContext) {
            const tabs: Xrm.Controls.Tab[] = currentFormContext.ui.tabs?.get();
            const sections: Xrm.Controls.Section[] = tabs?.flatMap(t => t.sections?.get());

            return sections;
        }
        else {
            return null;
        }
    }, [currentFormContext]);

    const toggleLabelDisplay = () => {
        setLabelDisplayed((prev) => !prev);
    }

    return (<>
        <Tooltip title='Show Tabs & Sections Logical Name' placement='left'>
            <Button
                variant='contained'
                onClick={toggleLabelDisplay}
                startIcon={labelDisplayed ? <BookIcon /> : <BookOutlinedIcon />}
            />
        </Tooltip>
        <>{
            tabs?.map((c) => {
                const tabName: string = c.getName();
                const tabNode: Element | null = document.querySelector("li[data-id$=\"tablist-" + tabName + "\"]");

                let content;
                if (!tabNode?.firstElementChild?.hasAttribute('tablogicalname')) {
                    content = document.createElement('div');
                    content.setAttribute('tablogicalname', '');
                    tabNode?.insertBefore(content, tabNode.children[0]);
                }
                else {
                    content = tabNode?.firstElementChild;
                }

                return (
                    <Portal container={content}>
                        {labelDisplayed && <LogicalNameTypography label={tabName} onClick={copyToClipboard} />}
                    </Portal>
                );
            })
        }</>
        <>{
            sections?.map((c) => {
                const sectionName: string = c.getName();
                const sectionNode: Element | null = document.querySelector("section[data-id$=\"" + sectionName + "\"]");

                let content;
                if (!sectionNode?.firstElementChild?.hasAttribute('sectionlogicalname')) {
                    content = document.createElement('div');
                    content.setAttribute('sectionlogicalname', '');
                    sectionNode?.prepend(content);
                }
                else {
                    content = sectionNode?.firstElementChild;
                }

                return (
                    <Portal container={content}>
                        {labelDisplayed && <LogicalNameTypography label={sectionName} onClick={copyToClipboard} />}
                    </Portal>
                );
            })
        }</>
    </>
    );
}

export default ShowTabLabel;