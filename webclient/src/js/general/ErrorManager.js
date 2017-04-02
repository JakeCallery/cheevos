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
        this.isOpen = false;
        this.timeoutId = null;

        l.debug('New ErrorManager');
    }

    init(){
        let self = this;

        //setup UI
        this.errorUIWrapperDiv = this.doc.createElement('div');
        this.errorUIWrapperDiv.id = 'errorUIWrapperDiv';
        DOMUtils.addClass(this.errorUIWrapperDiv, 'errorUIWrapperDiv');

        this.errorUIP = this.doc.createElement('p');
        this.errorUIP.innerHTML = '';
        DOMUtils.addClass(this.errorUIP, 'errorUIP');
        this.errorUIWrapperDiv.appendChild(this.errorUIP);

        this.errorCloseButton = this.doc.createElement('button');
        DOMUtils.addClass(this.errorCloseButton, 'errorCloseButton');
        this.errorCloseButton.innerHTML = 'CLOSE';
        this.errorUIWrapperDiv.appendChild(this.errorCloseButton);

        //setup events
        this.errorEventDelegate = EventUtils.bind(self, self.handleErrorEvent);
        this.geb.addEventListener('errorevent', this.errorEventDelegate);
        this.errorCloseButton.addEventListener('click', ($evt) => {
            l.debug('Caught Error Close Click');
            this.closeUI();
        });
    }

    openUI($errMessage) {
        let br = '';
        if(this.isOpen){
            br = '<br/>';
        }

        this.errorUIP.innerHTML += (br + 'Error: ' + $errMessage);

        this.isOpen = true;
        this.doc.body.appendChild(this.errorUIWrapperDiv);
    }

    closeUI() {
        this.isOpen = false;
        this.clearUITimeout();
        this.errorUIP.innerHTML = '';
        if(this.errorUIWrapperDiv.parentNode){
            this.errorUIWrapperDiv.parentNode.removeChild(this.errorUIWrapperDiv);
        }
    }

    clearUITimeout(){
        if(this.timeoutId){
            l.debug('Clearing Error UI Timeout');
            clearTimeout(this.timeoutId);
        }
    }

    handleErrorEvent($evt){
        l.debug('---------- Caught Error Event');
        this.openUI($evt.data);
        this.clearUITimeout();
        this.timeoutId = setTimeout(() => {
            l.debug('Time\'s up, closing error UI');
            this.closeUI();
        }, 5000);
    }
}
