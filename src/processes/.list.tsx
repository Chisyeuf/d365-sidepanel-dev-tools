
import { ProcessButton } from '../utils/global/.processClass';
import { StorageConfiguration } from '../utils/types/StorageConfiguration';
import formTools from './formTools/main';
import impersonation from './impersonation/main';
import createConfiguration from './setConfiguration/main';
import updateRecord from './updateRecord/main';
import webResourceEditor from './webResourceEditor/main';
import allFields from './allFields/main';
import relatedRecords from './relatedRecords/main';
import commandDebugger from './commandDebugger/main';
import dirtyFields from './dirtyFields/main';
import navigation from './navigation/main';
import pluginTraceLogsExplorer from './pluginTraceLogsExplorer/main';
import optionSetTable from './optionSetTable/main';
import entitiesList from './entitiesList/main';
import metadataBrowser from './metadataBrowser/MetadataBrowser';

const Processes: ProcessButton[] = [
    formTools,
    updateRecord,
    allFields,
    optionSetTable,
    dirtyFields,
    relatedRecords,
    entitiesList,
    impersonation,
    webResourceEditor,
    pluginTraceLogsExplorer,
    metadataBrowser,
    // myUserRecord,
    navigation,
    commandDebugger,
    createConfiguration,
];

export const defaultProcessesList: StorageConfiguration[] = Processes.map(p => {
    return {
        id: p.id,
        startOnLoad: false,
        hidden: false,
        expand: false,
        options: null,
    }
})


export default Processes;


// Changer Command Debug en un process ouvrable (et un bouton visible à droite). Lorsque le panel s'ouvre => executer le code.
// Workflow Activities Explorer
// OptionSet: Ajouter un bouton CopyAll