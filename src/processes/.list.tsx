
import { ProcessButton } from '../utils/global/.processClass';
import { StorageConfiguration } from '../utils/types/StorageConfiguration';
import formTools from './formTools/main';
import impersonation from './impersonation/main';
import createConfiguration from './setConfiguration/main';
import updateRecord from './updateRecord/main';
import webResourceEditor from './webResourceEditor/main';
import allFields from './allFields/main';
import relatedRecords from './relatedRecords/main';
import myUserRecord from './myUserRecord/main';
import commandDebugger from './commandDebugger/main';
import dirtyFields from './dirtyFields/main';
import navigation from './navigation/main';
import pluginTraceLogsExplorer from './pluginTraceLogsExplorer/main';
import optionSetTable from './optionSetTable/main';
import entitiesList from './entitiesList/main';

const Processes: ProcessButton[] = [
    formTools,
    updateRecord,
    allFields,
    optionSetTable,
    dirtyFields,
    relatedRecords,
    entitiesList,
    webResourceEditor,
    impersonation,
    pluginTraceLogsExplorer,
    // myUserRecord,
    navigation,
    commandDebugger,
    createConfiguration,
];

// Xrm.Internal.addPopupNotification({entityLookUpValue:"", title:"dzf", acceptAction:{}, declineAction:{} })

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


// const processes = [
//     {
//         id: "devtools",
//         name: "Dev Tools",
//         htmlFile: "html/devTools.html",
//         scriptFile: "/scripts/processes/devTools.js",
//         icon: "icons/toolbox-repairing-icon.svg",
//         width: 56,
//     },
//     {
//         id: "showOptionSetValues",
//         name: "Show OptionSet Values",
//         htmlFile: "html/showOptionSetValues.html",
//         scriptFile: "/scripts/processes/showOptionSetValues.js",
//         icon: "icons/optionSetValues.svg",
//         width: 350,
//     },
//     {
//         id: "updateRecord",
//         name: "Update Record",
//         htmlFile: "html/updateRecord.html",
//         scriptFile: "/scripts/processes/updateRecord.js",
//         icon: "icons/update.svg",
//         width: 500,
//     },
//     {
//         id: "showRelationships",
//         name: "Show Relationships",
//         htmlFile: "html/showOptionSetValues.html",
//         scriptFile: "/scripts/processes/showOptionSetValues.js",
//         icon: "icons/relationship.svg",
//         width: 350,
//     },
// chrome.storage.onChanged.addListener

// // Edit JS en temps réel et publier
// // Visualization/Tracking des processus sur le record
// // lister tous les related records
// lister les users qui ont accès à un enregistrement avec leur niveau d'accès
// lister les entities pour afficher les grilles de records non présent dans l'apps
// // lister les environnements
// // Navigation vers Power Apps et Power Admin et les différent environnement du tenant
// ];