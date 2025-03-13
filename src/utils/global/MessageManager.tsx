import { MessageType } from "../types/Message";
import { debugLog } from "./common";
import { MESSAGE_SOURCE_Content, MESSAGE_SOURCE_WebPage } from "./var";



class MessageManager {
    constructor() {
        window.addEventListener('message', this.onMessage.bind(this));
    }

    private messageId = 0;
    private messageCallbacks: { [id: number]: (result: any) => void } = {};

    private onMessage(event: MessageEvent) {
        if (event.source !== window) return;
        if (event.data.source !== MESSAGE_SOURCE_Content) return;
        
        const data = event.data;
        debugLog('onMessage', data);
        if (data && data.id && this.messageCallbacks[data.id]) {
            this.messageCallbacks[data.id](data.response);
            delete this.messageCallbacks[data.id];
        }
    }

    sendMessage(type: MessageType, data: any = null): Promise<any> {
        debugLog('sendMessage', type, data);
        return new Promise((resolve, reject) => {
            this.messageId++;
            const id = this.messageId;
            this.messageCallbacks[id] = resolve;
            window.postMessage({ id, type, data, source: MESSAGE_SOURCE_WebPage }, '*');
        });
    }
}

const messageManager = new MessageManager()
export default messageManager;