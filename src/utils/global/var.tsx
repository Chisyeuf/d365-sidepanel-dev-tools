
export class Env {
    static DEBUG = true;
}

export const DEBUG_MODE = false;

export const PROJECT_PREFIX = 'spdevtools-';

export const STORAGE_ListName = 'processListOrdered';
export const STORAGE_ForegroundPanes = 'isPanesForeground';

export const STORAGE_DontShowInfo = 'dontShowInfo';
export type TYPE_DontShowInfo = { [infoName: string]: boolean };

export const DRAWER_CONTAINER_ID = 'drawercontainer';

export const APPLICATION_NAME = 'Dynamics SideKick';
export const MAIN_MENU_ID = 'sidepanel-mainmenu';

export const MESSAGE_SOURCE_WebPage = `${APPLICATION_NAME}_webPage`;
export const MESSAGE_SOURCE_Content = `${APPLICATION_NAME}_content`;