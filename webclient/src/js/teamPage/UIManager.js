/**
 * Created by Jake on 3/11/2017.
 */

import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import BadgeUIMaker from 'general/BadgeUIMaker'
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import HeaderUIManager from 'header/HeaderUIManager';

class UIManager extends EventDispatcher {
    constructor($doc){
        super();

        //Public properties
        this.geb = new GlobalEventBus();

        //DOM Elements
        this.doc = $doc;

        //Managers
        this.headerUIManager = new HeaderUIManager(this.doc);

        l.debug('new Team Page UI Manager');
    }

    init(){
        l.debug('Team Page UI Manager init');

        //setup header
        this.headerUIManager.init();

        //DOM ELEMENTS

        //Delegates

        //Event Handlers

        //Global Events


    }
}

export default UIManager;