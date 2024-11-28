import { createContext, useCallback, useEffect, useState } from "react";
import { IPluginTraceLogControllerContext, ITraceLogsAPI, PluginTraceLog, SdkMessageProcessingStep, SdkMessageProcessingStepImage } from "../type";
import { debugLog, noOperation } from "../../../global/common";
import { RetrieveRecordsByFilter } from "../../../hooks/XrmApi/RetrieveRecordsByFilter";
import { useDictionnary } from "../../../hooks/use/useDictionnary";
import { useStateArray } from "../../../hooks/use/useStateArray";
import { useStateQueue } from "../../../hooks/use/useStateQueue";

const defaultPluginTraceLogController: IPluginTraceLogControllerContext = {
    detailsDialogOpened: false,
    openDialog: noOperation,
    closeDialog: noOperation,
    selectedPluginTraceLog: null,
    selectedSdkMessageProcessingStep: null,
    selectedSdkMessageProcessingStepImages: []
};
export const TraceLogControllerContext = createContext<IPluginTraceLogControllerContext>(defaultPluginTraceLogController);

interface TraceLogControllerProps {
}
export const TraceLogController = (props: TraceLogControllerProps & React.PropsWithChildren) => {
    const { children } = props;

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPluginTraceLog, setSelectedPluginTraceLog] = useState<PluginTraceLog | null>(null);
    const [selectedSdkMessageProcessingStep, setSelectedSdkMessageProcessingStep] = useState<SdkMessageProcessingStep | null>(null);
    const [selectedSdkMessageProcessingStepImages, setSelectedSdkMessageProcessingStepImages] = useState<SdkMessageProcessingStepImage[]>([]);

    const handleOpenDialog = (selectedPluginTraceLog: PluginTraceLog, relatedSdkMessageProcessingStep: SdkMessageProcessingStep | null, sdkMessageProcessingStepImages: SdkMessageProcessingStepImage[] | null) => {
        setSelectedPluginTraceLog(selectedPluginTraceLog);
        setSelectedSdkMessageProcessingStep(relatedSdkMessageProcessingStep);
        setSelectedSdkMessageProcessingStepImages(sdkMessageProcessingStepImages ?? []);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedPluginTraceLog(null);
        setSelectedSdkMessageProcessingStep(null);
        setSelectedSdkMessageProcessingStepImages([]);
    };

    return (
        <TraceLogControllerContext.Provider value={{
            detailsDialogOpened: dialogOpen,
            closeDialog: handleCloseDialog,
            openDialog: handleOpenDialog,
            selectedPluginTraceLog: selectedPluginTraceLog,
            selectedSdkMessageProcessingStep: selectedSdkMessageProcessingStep,
            selectedSdkMessageProcessingStepImages: selectedSdkMessageProcessingStepImages
        }}>
            {children}
        </TraceLogControllerContext.Provider>
    );
}




const fetchDataSteps = async (pluginTraceLog: PluginTraceLog, addMessageProcessingSteps: (key: string, value: SdkMessageProcessingStep) => void, setIsFetchingStep: (value: React.SetStateAction<boolean>) => void) => {
    debugLog("RetrievePluginSteps");
    const result = await Xrm.WebApi.online.retrieveRecord('sdkmessageprocessingstep', pluginTraceLog.pluginstepid, "?$select=" + ['stage', 'name', 'filteringattributes'].join(','));
    delete result["@odata.context"];
    delete result["@odata.etag"];
    // await yieldToMain();
    addMessageProcessingSteps(pluginTraceLog.plugintracelogid, result);
    setIsFetchingStep(false);
}

const fetchDataImages = async (pluginTraceLog: PluginTraceLog, addMessageProcessingStepImages: (key: string, value: SdkMessageProcessingStepImage[]) => void, setIsFetchingImages: (value: React.SetStateAction<boolean>) => void) => {
    debugLog("RetrievePluginImages");
    const result = await Xrm.WebApi.online.retrieveMultipleRecords('sdkmessageprocessingstepimage', `?$select=${['entityalias', 'imagetype', 'attributes'].join(',')}&$filter=_sdkmessageprocessingstepid_value eq ${pluginTraceLog.pluginstepid}`);
    // await yieldToMain();
    addMessageProcessingStepImages(pluginTraceLog.plugintracelogid, result.entities);
    setIsFetchingImages(false);
}

export const defaultTraceLogsAPI: ITraceLogsAPI = {
    pluginTraceLogs: [],
    isFetchingPluginTraceLogs: false,
    refreshPluginTraceLogs: noOperation,
    sdkMessageProcessingStepImages: {},
    sdkMessageProcessingSteps: {},
    isFetchingSteps: false,
    addStepToFetchingQueue: noOperation,
    // addMessageProcessingSteps: noOperation,
    // addMessageProcessingStepImages: noOperation
}
export const TraceLogsAPIContext = createContext<ITraceLogsAPI>(defaultTraceLogsAPI);

interface TraceLogsAPIProps {
    maxFetchingRecord?: number
}
export const TraceLogsAPI = (props: TraceLogsAPIProps & React.PropsWithChildren) => {
    const { maxFetchingRecord = 10, children } = props;


    const [pluginTraceLogs, isFetching, refreshPluginTraceLogs]: [PluginTraceLog[], boolean, () => void] = RetrieveRecordsByFilter('plugintracelog', [], '', 'performanceexecutionstarttime desc');
    const { dict: sdkMessageProcessingSteps, setValue: addMessageProcessingSteps } = useDictionnary<SdkMessageProcessingStep>({});
    const { dict: sdkMessageProcessingStepImages, setValue: addMessageProcessingStepImages } = useDictionnary<SdkMessageProcessingStepImage[]>({});

    const { items: fetchLogQueueItems, shift: getNextPluginTraceLogToFetch, unshift: addPluginTraceLogToFetch } = useStateQueue<PluginTraceLog>([]);
    const [isFetchingSteps, setIsFetchingSteps] = useState(false);

    useEffect(() => {
        if (isFetchingSteps) {
            return;
        }

        async function fetch(pluginTraceLogs: PluginTraceLog[]) {
            debugLog("RetrievePluginSteps & RetrievePluginImages", pluginTraceLogs.length);
            const resultProcessingSteps = await Xrm.WebApi.online.retrieveMultipleRecords('sdkmessageprocessingstep', `?$select=stage,name,filteringattributes&$filter=${pluginTraceLogs.map(pluginTraceLog => `sdkmessageprocessingstepid eq ${pluginTraceLog.pluginstepid}`).join(' or ')}`);

            pluginTraceLogs.forEach(pluginTraceLog => {
                addMessageProcessingSteps(pluginTraceLog.plugintracelogid, resultProcessingSteps.entities.find(step => step.sdkmessageprocessingstepid === pluginTraceLog.pluginstepid));
            });


            const resultPluginImages = await Xrm.WebApi.online.retrieveMultipleRecords('sdkmessageprocessingstepimage', `?$select=entityalias,imagetype,attributes,_sdkmessageprocessingstepid_value&$filter=${pluginTraceLogs.map(pluginTraceLog => `_sdkmessageprocessingstepid_value eq ${pluginTraceLog.pluginstepid}`).join(' or ')}`);

            pluginTraceLogs.forEach(pluginTraceLog => {
                addMessageProcessingStepImages(pluginTraceLog.plugintracelogid, resultPluginImages.entities.filter(images => images._sdkmessageprocessingstepid_value === pluginTraceLog.pluginstepid));
            });

            setIsFetchingSteps(false);
        }

        const queueItemsToProcess = getNextPluginTraceLogToFetch(maxFetchingRecord);
        if (queueItemsToProcess?.length) {
            setIsFetchingSteps(true);
            fetch(queueItemsToProcess);
        }

    }, [isFetchingSteps, fetchLogQueueItems, getNextPluginTraceLogToFetch, maxFetchingRecord, addMessageProcessingSteps, addMessageProcessingStepImages]);


    // useEffect(() => {

    //     async function fetch(pluginTraceLogs: PluginTraceLog[]) {

    //         debugLog("RetrievePluginSteps & RetrievePluginImages", pluginTraceLogs.length);
    //         // const resultProcessingStep0 = await Xrm.WebApi.online.retrieveRecord('sdkmessageprocessingstep', pluginTraceLog.pluginstepid, "?$select=" + ['stage', 'name', 'filteringattributes'].join(','));
    //         const resultProcessingSteps = await Xrm.WebApi.online.retrieveMultipleRecords('sdkmessageprocessingstep', `?$select=stage,name,filteringattributes&$filter=${pluginTraceLogs.map(pluginTraceLog => `sdkmessageprocessingstepid eq ${pluginTraceLog.pluginstepid}`).join(' or ')}`);

    //         pluginTraceLogs.forEach(pluginTraceLog => {
    //             addMessageProcessingSteps(pluginTraceLog.plugintracelogid, resultProcessingSteps.entities.find(step => step.sdkmessageprocessingstepid === pluginTraceLog.pluginstepid));
    //         });


    //         const resultPluginImages = await Xrm.WebApi.online.retrieveMultipleRecords('sdkmessageprocessingstepimage', `?$select=entityalias,imagetype,attributes,_sdkmessageprocessingstepid_value&$filter=${pluginTraceLogs.map(pluginTraceLog => `_sdkmessageprocessingstepid_value eq ${pluginTraceLog.pluginstepid}`).join(' or ')}`);

    //         pluginTraceLogs.forEach(pluginTraceLog => {
    //             addMessageProcessingStepImages(pluginTraceLog.plugintracelogid, resultPluginImages.entities.filter(images => images._sdkmessageprocessingstepid_value === pluginTraceLog.pluginstepid));
    //         });

    //         setIsFetchingSteps(false);

    //     }

    //     if (fetchingTraceLogs.length) {
    //         setIsFetchingSteps(true);
    //         fetch(fetchingTraceLogs);
    //     }
    // }, [fetchingTraceLogs, addMessageProcessingSteps, addMessageProcessingStepImages]);

    const addStepToFetchingQueue = useCallback((pluginTraceLog: PluginTraceLog) => {
        if (fetchLogQueueItems.find(item => item.plugintracelogid === pluginTraceLog.plugintracelogid)) {
            return;
        }
        if (Object.keys(sdkMessageProcessingSteps).includes(pluginTraceLog.plugintracelogid)) {
            return;
        }

        addPluginTraceLogToFetch(pluginTraceLog);
    }, [addPluginTraceLogToFetch, fetchLogQueueItems, sdkMessageProcessingSteps]);



    return (
        <TraceLogsAPIContext.Provider value={{
            pluginTraceLogs: pluginTraceLogs,
            isFetchingPluginTraceLogs: isFetching,
            refreshPluginTraceLogs: refreshPluginTraceLogs,

            sdkMessageProcessingSteps: sdkMessageProcessingSteps,
            sdkMessageProcessingStepImages: sdkMessageProcessingStepImages,
            isFetchingSteps: isFetchingSteps,
            addStepToFetchingQueue: addStepToFetchingQueue,
            // addMessageProcessingSteps: addMessageProcessingSteps,
            // addMessageProcessingStepImages: addMessageProcessingStepImages,
        }} >
            {children}
        </TraceLogsAPIContext.Provider>
    )
}