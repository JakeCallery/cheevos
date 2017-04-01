/**
 * Created by Jake on 4/1/2017.
 */
import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';

export default class ErrorManager extends EventDispatcher {
    constructor($doc){
        super();
        this.doc = $doc;
        this.geb = new GlobalEventBus();
        l.debug('New ErrorManager');
    }

    init(){
        let self = this;
        //setup UI
        this.errorUIDiv = this.doc.createElement('div');
        this.errorUIDiv.id = 'errorUIDiv';
        DOMUtils.addClass(this.errorUIDiv, 'errorUIDiv');

        this.errorUIP = this.doc.createElement('p');
        this.errorUIP.innerHTML = 'Error';
        DOMUtils.addClass(this.errorUIP, 'errorUIP');
        this.errorUIDiv.appendChild(this.errorUIP);

        //setup events
        this.errorEventDelegate = EventUtils.bind(self, self.handleErrorEvent);
        this.geb.addEventListener('errorevent', this.errorEventDelegate);
    }

    handleErrorEvent($evt){
        l.debug('---------- Caught Error Event');
        this.errorUIP.innerHTML = 'Error: ' + $evt.data;
        this.doc.body.appendChild(this.errorUIDiv);
    }
}
