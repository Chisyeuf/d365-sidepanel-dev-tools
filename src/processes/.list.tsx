import React from 'react';

import { ProcessButton } from '../utils/global/.processClass';
import formTools from './formTools/main';
import updateRecord from './updateRecord/main';

const Processes: ProcessButton[] = [formTools, updateRecord];


export type StorageProcessList = {
    id: string
    startOnLoad: boolean,
    hidden: boolean,
    expand: boolean,
}

export const defaultProcessesList: StorageProcessList[] = Processes.map(p => {
    return {
        id: p.id,
        startOnLoad: false,
        hidden: false,
        expand: false,
    }
})

export const storageListName = 'processListOrdered'
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

// Edit JS en temps réel et publier
// Visualization/Tracking des processus sur le record
// lister tous les related records
// lister les users qui ont accès à un enregistrement avec leur niveau d'accès
// lister les entities pour afficher les grilles de records non présent dans l'apps
// lister les environnements
// Impersonnation
// ];