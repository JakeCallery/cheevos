/**
 * Created by Jake on 3/26/2017.
 */

import EventDispatcher from 'jac/events/EventDispatcher';
let instance = null;
import UIRequestEvent from 'general/UIRequestEvent';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import shortId from 'shortid';
import l from 'jac/logger/Logger';

export default class UIGEB extends EventDispatcher {
    constructor(){
        super();
        if(!instance){
            instance = this;
            instance.eventCBDict = {};
            l.debug('New UIGEB: ')
        }
        return instance;
    }

    dispatchUIEvent($eventType, $data, $cb){
        l.debug('Dispatching: ', $eventType);
        let id = shortId.generate();
        this.eventCBDict[id] = $cb;
        this.dispatchEvent(new UIRequestEvent(id, $eventType, $data));
    }

    completeUIEvent($id, $data){
        l.debug('Data: ', $data);
        if(this.eventCBDict[$id]){
            this.eventCBDict[$id]($data);
            delete this.eventCBDict[$id];
        } else {
            l.error('No UI Event ID: ', $id);
        }
    }
}
