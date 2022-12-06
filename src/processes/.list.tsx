import React from 'react';

import { ProcessButton } from '../utils/global/.processClass';
import devTools from './devTools';
import updateRecord from './updateRecord';

const Processes: ProcessButton[] = [devTools, updateRecord];


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
// Visualization/Tracking des processus
// lister les environnements
// ];