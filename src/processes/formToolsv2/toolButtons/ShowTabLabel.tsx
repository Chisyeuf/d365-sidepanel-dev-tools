import { useContext, useEffect, useMemo } from 'react';

import { Portal } from '@mui/base';
import BookIcon from '@mui/icons-material/Book';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import { LogicalNameTypography } from '../../../utils/components/LogicalNameTypography';
import { IToolButtonControlled, ToolButton } from '../ToolButton';
import { useDictionnary } from '../../../utils/hooks/use/useDictionnary';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { FormToolContext } from '../context';

function ShowTabLabel(props: IToolButtonControlled) {

    const { enabled: labelDisplayed, setEnabled: setLabelDisplayed, } = props;

    const { formContext, formDocument, domUpdated, xrmRoute } = useContext(FormToolContext);

    const tabControls = useMemo(async () => {
        if (formContext) {
            const tabs: Xrm.Controls.Tab[] = formContext.ui.tabs?.get();

            return tabs;
        }
        else {
            return null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domUpdated, formContext]);

    const sectionControls = useMemo(async () => {
        if (formContext) {
            const tabs: Xrm.Controls.Tab[] = formContext.ui.tabs?.get();
            const sections: Xrm.Controls.Section[] = tabs?.flatMap(t => t.sections?.get());

            return sections;
        }
        else {
            return null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domUpdated, formContext]);



    const { values: tabLabelNodes, setValue: setTabLabelNode, setDict: setTabLabelNodeDict } = useDictionnary<HTMLDivElement>({});
    useEffect(() => {
        if (!formDocument) {
            return;
        }
        tabControls.then(controls => controls?.forEach((tabControl) => {
            const tabName: string = tabControl.getName();
            const tabNodeParent = formDocument.querySelector<HTMLElement>(`li[data-id$="tablist-${tabName}"]:not(:has([tablogicalname]))`);

            if (tabNodeParent) {
                const tabNode = formDocument.createElement('div');
                tabNode.setAttribute('tablogicalname', tabName);
                tabNodeParent?.insertBefore(tabNode, tabNodeParent.children[0]);
                setTabLabelNode(tabName, tabNode);
            }
            else {
                const tabNodeAlreadyProcessed = formDocument.querySelector<HTMLDivElement>(`li[data-id$="tablist-${tabName}"] > div[tablogicalname]`);
                if (tabNodeAlreadyProcessed)
                    setTabLabelNode(tabName, tabNodeAlreadyProcessed);
            }
        }));
    }, [domUpdated, tabControls, formDocument, setTabLabelNode]);

    const { values: sectionLabelNodes, setValue: setSectionLabelNode, setDict: setSectionLabelNodeDict } = useDictionnary<HTMLDivElement>({});
    useEffect(() => {
        if (!formDocument) {
            return;
        }
        sectionControls.then(controls => controls?.forEach((sectionControl) => {
            const sectionName: string = sectionControl.getName();
            const sectionNodeParent: Element | null = formDocument.querySelector(`section[data-id$="${sectionName}"]:not(:has([sectionlogicalname]))`);

            if (sectionNodeParent) {
                const sectionNode = formDocument.createElement('div');
                sectionNode.setAttribute('sectionlogicalname', sectionName);
                sectionNodeParent?.prepend(sectionNode);
                setSectionLabelNode(sectionName, sectionNode);
            }
            else {
                const sectionNodeAlreadyProcessed = formDocument.querySelector<HTMLDivElement>(`section[data-id$="${sectionName}"] > div[sectionlogicalname]`);
                if (sectionNodeAlreadyProcessed)
                    setSectionLabelNode(sectionName, sectionNodeAlreadyProcessed);
            }
        }));
    }, [domUpdated, sectionControls, formDocument, setSectionLabelNode]);

    useEffect(() => {
        setTabLabelNodeDict({});
        setSectionLabelNodeDict({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setTabLabelNodeDict, setSectionLabelNodeDict, xrmRoute.current]);



    const tabLabelPortal = useMemo(() => {
        if (!labelDisplayed) {
            return;
        }
        return tabLabelNodes?.map(controlNode => {
            const controlName = controlNode.getAttribute('tablogicalname');
            if (!controlName) {
                return null;
            }
            return (
                <Portal container={controlNode}>
                    <LogicalNameTypography label={controlName} />
                </Portal>
            );
        });
    }, [labelDisplayed, tabLabelNodes]);

    const sectionLabelPortal = useMemo(() => {
        if (!labelDisplayed) {
            return;
        }
        return sectionLabelNodes?.map(controlNode => {
            const controlName = controlNode.getAttribute('sectionlogicalname');
            if (!controlName) {
                return null;
            }
            return (
                <Portal container={controlNode}>
                    <LogicalNameTypography label={controlName} />
                </Portal>
            );
        });
    }, [labelDisplayed, sectionLabelNodes]);


    const cache = createCache({
        key: 'css',
        container: formDocument?.head ?? document.head,
        prepend: true
    });


    return (
        <>
            <ToolButton
                controlled={true}
                icon={labelDisplayed ? <BookIcon /> : <BookOutlinedIcon />}
                tooltip='Show Tabs & Sections Control LogicalNames'
                setEnabled={setLabelDisplayed}
            />
            <CacheProvider value={cache as any}>
                {tabLabelPortal}
                {sectionLabelPortal}
            </CacheProvider>
        </>
    );
}

export default ShowTabLabel;