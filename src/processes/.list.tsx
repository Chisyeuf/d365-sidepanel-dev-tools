
import { ProcessButton } from '../utils/global/.processClass';
import { StorageConfiguration } from '../utils/types/StorageConfiguration';
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
import metadataBrowser from './metadataBrowser/main';
import formToolsV2 from './formToolsv2/main';

const Processes: ProcessButton[] = [
    // formTools,
    formToolsV2,
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


// Workflow Activities Explorer
// Mettre en place un systeme qui selection automatiquement les champs obligatoires dans création/update tool
// Ajouter un bouton pour les reviews dans footer
// Update: field droplist n'a pas de barre vertical + tooltip clignote
// Impersonate: Check security role filtering when user have a role twice