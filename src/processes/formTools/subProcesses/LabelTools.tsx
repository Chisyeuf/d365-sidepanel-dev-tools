import { Tooltip, IconButton, Stack, Button, styled, Typography } from '@mui/material';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ComponentContainer from '../../../utils/components/ComponentContainer';
import { SubProcessProps } from '../main';


import TurnedInIcon from '@mui/icons-material/TurnedIn';
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import { Portal } from '@mui/base';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useCopyToClipboard } from 'usehooks-ts';
import LabelIcon from '@mui/icons-material/Label';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import BookIcon from '@mui/icons-material/Book';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import { ControlType } from '../../../utils/types/ControlType';

type LabelToolsSubProcess = {
    enabled: boolean,
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>
    domUpdated: boolean,
    copyToClipboard: (text: string) => Promise<boolean>,
}
function LabelTools(props: SubProcessProps & { domUpdated: boolean }) {

    const [value, copy] = useCopyToClipboard();


    const [allModeEnabled, setAllModeEnabled] = useState<boolean>(false);
    const [fieldLabelEnabled, setFieldLabelEnabled] = useState<boolean>(false);
    const [tabLabelEnabled, setTabLabelEnabled] = useState<boolean>(false);


    useEffect(() => {
        if (!allModeEnabled && tabLabelEnabled && fieldLabelEnabled) {
            setAllModeEnabled(true);
            return;
        }
        if (allModeEnabled && (!tabLabelEnabled || !fieldLabelEnabled)) {
            setAllModeEnabled(false);
            return;
        }
    }, [fieldLabelEnabled, tabLabelEnabled]);

    const toggleAll = useCallback(() => {
        const newAllMode = !allModeEnabled;
        setFieldLabelEnabled(newAllMode);
        setTabLabelEnabled(newAllMode);
    }, [allModeEnabled]);

    return (
        <ComponentContainer
            width='100%'
            Legends={
                {
                    top: {
                        component: (
                            <Tooltip title='Toggle all' placement='left'>
                                <IconButton color='primary' onClick={toggleAll} size='small'>
                                    {allModeEnabled ? <LabelIcon fontSize="large" /> : <LabelOutlinedIcon fontSize="large" />}
                                </IconButton>
                            </Tooltip>
                        ),
                        margin: '15px',
                        padding: '15px'
                    },
                    left: {
                        component: <div style={{ writingMode: 'vertical-rl' }}>LabelTools</div>
                    }
                }
            }
        >
            <Stack spacing={1} width='calc(100% - 10px)' padding='5px'>
                <ShowFieldLabel
                    enabled={fieldLabelEnabled}
                    setEnabled={setFieldLabelEnabled}
                    executionContext={props.executionContext}
                    executionContextUpdated={props.executionContextUpdated}
                    domUpdated={props.domUpdated}
                    copyToClipboard={copy}
                />
                <ShowTabLabel
                    enabled={tabLabelEnabled}
                    setEnabled={setTabLabelEnabled}
                    executionContext={props.executionContext}
                    executionContextUpdated={props.executionContextUpdated}
                    domUpdated={props.domUpdated}
                    copyToClipboard={copy}
                />
            </Stack>
        </ComponentContainer>
    );
}

const LogicalNameRoot = styled(Stack<'span'>)(({ theme }) => ({
    // color: theme.palette.text.secondary,
    fontSize: '11.2px',
    lineHeight: '1.1em',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'color 200ms cubic-bezier(0.76, 0, 0.24, 1) 0s',
}));
const LogicalNameTypoRoot = styled(Typography)(({ theme }) => ({
    fontSize: 'inherit',
    lineHeight: 'inherit',
    color: 'inherit',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
}))

function LogicalNameTypography(props: { label: string, onClick: (text: string) => any }) {

    const [clicked, setClicked] = useState<boolean>(false);

    const onClick = () => {
        setClicked(true);
        props.onClick(props.label);
        setTimeout(() => {
            setClicked(false);
        }, 200);
    }

    return (
        <LogicalNameRoot
            component='span'
            spacing={0.5}
            direction='row'
            alignItems='center'
            onClick={onClick}
            color={(theme) => clicked ? theme.palette.primary.dark : theme.palette.text.secondary}>
            <ContentCopyIcon fontSize='inherit' color='inherit' />
            <LogicalNameTypoRoot title={props.label} variant='caption' fontSize='inherit' lineHeight='inherit' color='inherit'>
                {props.label}
            </LogicalNameTypoRoot>
        </LogicalNameRoot>

    );
}

function ShowTabLabel(props: SubProcessProps & LabelToolsSubProcess) {

    const { enabled: labelDisplayed, setEnabled: setLabelDisplayed, executionContext, executionContextUpdated, domUpdated, copyToClipboard } = props;

    useEffect(() => { }, [domUpdated]);


    const tabs = useMemo(() => {
        if (executionContext) {
            const formContext = executionContext.getFormContext();
            const tabs: Xrm.Controls.Tab[] = formContext.ui.tabs.get();

            return tabs;
        }
        else {
            return null;
        }
    }, [executionContextUpdated]);

    const tabsNode = useMemo(() => {
        if (!tabs) return [];

        return tabs.map((c) => {
            const tabName: string = c.getName();
            const tabNode: Element | null = document.querySelector("li[data-id$=\"tablist-" + tabName + "\"]");
            const tabFirstChild = tabNode?.firstChild;

            let content;
            if (tabFirstChild?.nodeName === '#text') {
                tabFirstChild?.remove();
                content = document.createElement('div');
                tabNode?.prepend(content);
            }
            else {
                content = tabNode?.firstElementChild;
                content && (content.innerHTML = '');
            }

            const tabDisplayName = tabNode?.lastChild?.textContent;

            return (
                {
                    node: content,
                    displayName: tabDisplayName,
                    name: tabName
                }
            );
        })
    }, [tabs]);

    const sections = useMemo(() => {
        if (executionContext) {
            const formContext = executionContext.getFormContext();
            const tabs: Xrm.Controls.Tab[] = formContext.ui.tabs.get();
            const sections: Xrm.Controls.Section[] = tabs.flatMap(t => t.sections.get());

            return sections;
        }
        else {
            return null;
        }
    }, [executionContextUpdated]);

    const sectionsNode = useMemo(() => {
        if (!sections) return [];

        return sections.map((c) => {
            const sectionName: string = c.getName();
            const sectionNode: Element | null = document.querySelector("section[data-id$=\"" + sectionName + "\"]");

            let content;
            if (sectionNode?.firstElementChild?.hasAttribute('role')) {
                content = document.createElement('div');
                sectionNode?.prepend(content);
            }
            else {
                content = sectionNode?.firstElementChild;
                content && (content.innerHTML = '');
            }

            return (
                {
                    node: content,
                    name: sectionName
                }
            )
        })
    }, [sections]);

    const toggleLabelDisplay = () => {
        setLabelDisplayed((prev) => !prev);
    }

    return (<>
        <Tooltip title='Show Tabs and Sections LogicalName' placement='left'>
            <Button
                variant='contained'
                onClick={toggleLabelDisplay}
                startIcon={labelDisplayed ? <BookIcon /> : <BookOutlinedIcon />}
            />
        </Tooltip>
        <>{
            // tabs?.map((c) => {
            //     const tabName: string = c.getName();
            //     const tabNode: Element | null = document.querySelector("li[data-id$=\"tablist-" + tabName + "\"]");
            //     const tabFirstChild = tabNode?.firstChild;

            //     if (!tabFirstChild) return null;

            //     let content;
            //     if (tabFirstChild?.nodeName === '#text') {
            //         tabFirstChild?.remove();
            //         content = document.createElement('div');
            //         tabNode?.prepend(content);
            //     }
            //     else {
            //         content = tabNode?.firstElementChild;
            //         content && (content.innerHTML = '');
            //     }

            //     const tabDisplayName = tabNode?.lastChild?.textContent;

            //     return (
            //         <Portal container={content}>
            //             <Stack direction='column'>
            //                 <>{tabDisplayName}</>
            //                 {labelDisplayed && <LogicalNameTypography label={tabName} onClick={copyToClipboard} />}
            //             </Stack>
            //         </Portal>
            //     );
            // })
            tabsNode.map(({ node: content, displayName: tabDisplayName, name: tabName }) => {
                return (
                    <Portal container={content}>
                        <Stack direction='column'>
                            <>{tabDisplayName}</>
                            {labelDisplayed && <LogicalNameTypography label={tabName} onClick={copyToClipboard} />}
                        </Stack>
                    </Portal>
                );
            })
        }</>
        <>{
            // sections?.map((c) => {
            //     const sectionName: string = c.getName();
            //     const sectionNode: Element | null = document.querySelector("section[data-id$=\"" + sectionName + "\"]");

            //     let content;
            //     if (sectionNode?.firstElementChild?.hasAttribute('role')) {
            //         content = document.createElement('div');
            //         sectionNode?.prepend(content);
            //     }
            //     else {
            //         content = sectionNode?.firstElementChild;
            //     }

            //     return (
            //         <Portal container={content}>
            //             {labelDisplayed && <LogicalNameTypography label={sectionName} onClick={copyToClipboard} />}
            //         </Portal>
            //     );
            // })
            sectionsNode.map(({ node: content, name: sectionName }) => {
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

function ShowFieldLabel(props: SubProcessProps & LabelToolsSubProcess) {

    const { enabled: labelDisplayed, setEnabled: setLabelDisplayed, executionContext, executionContextUpdated, domUpdated, copyToClipboard } = props;

    useEffect(() => { }, [domUpdated]);


    const controls = useMemo(() => {
        if (executionContext) {
            const formContext = executionContext.getFormContext();
            const controls: Xrm.Controls.Control[] = formContext.getControl();

            return controls;
        }
        else {
            return null;
        }
    }, [executionContextUpdated]);

    const toggleLabelDisplay = () => {
        setLabelDisplayed((prev) => !prev);
    }

    return (<>
        <Tooltip title='Show Fields LogicalName' placement='left'>
            <Button
                variant='contained'
                onClick={toggleLabelDisplay}
                startIcon={labelDisplayed ? <TurnedInIcon /> : <TurnedInNotIcon />}
            />
        </Tooltip>
        {
            labelDisplayed &&
            controls?.map((c) => {
                const controlName = c.getName();
                const type = c.getControlType();
                let controlNode;
                switch (type) {
                    case ControlType.IFRAME:
                    case ControlType.SUBGRID:
                    case ControlType.WEBRESSOURCE:
                    case ControlType.NOTES:
                    case ControlType.TIMER:
                    case ControlType.KBSEARCH:
                    case ControlType.TIMELINE:
                    case ControlType.QUICKFORM:
                        return null;
                    case ControlType.LOOKUP:
                    case ControlType.STANDARD:
                    case ControlType.OPTIONSET:
                    default:
                        const controlNodeT = document.querySelector("label[id$=\"" + controlName + "-field-label\"]");
                        controlNode = controlNodeT?.parentElement?.parentElement ?? null;
                    // case XrmEnum.StandardControlType.SubGrid:
                    //     return null;
                    // case XrmEnum.StandardControlType.IFrame:
                    //     return null;
                }
                return (
                    <Portal container={controlNode}>
                        <LogicalNameTypography label={controlName} onClick={copyToClipboard} />
                    </Portal>
                );
            })
        }
    </>
    );
}

export default LabelTools;




    // createSchemaNameInput(controlName, utility.formDocument.getElementById(controlName + "_d"));

    // const controlNode = utility.formDocument.querySelector("label[id$=\"" + attributeName + "-field-label\"]") ||
    //     utility.formDocument.querySelector("label[id$=\"" + controlName + "-field-label\"]");

    // createSchemaNameInput(tabName, _this.utility.formDocument.querySelector("div[name=\"" + tabName + "\"]") ||
    //     _this.utility.formDocument.querySelector("li[data-id$=\"tablist-" + tabName + "\"]"));

    // createSchemaNameInput(sectionName, _this.utility.formDocument.querySelector("table[name=\"" + sectionName + "\"]") ||
    //     _this.utility.formDocument.querySelector("section[data-id$=\"" + sectionName + "\"]"));