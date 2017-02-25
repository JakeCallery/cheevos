/**
 * Created by Jake on 2/20/2017.
 */
import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';

class UIManager extends EventDispatcher {
    constructor($dom){
        super();

        //DOM Elements
        this.dom = $dom;
    }

    init(){
        let self = this;

        l.debug('UI Manager Init');
        //DOM ELEMENTS
        this.profileImg = this.dom.getElementById('profileImg');
        this.profileOverlayContainer = this.dom.getElementById('profileOverlayContainer');

        //Delegates
        this.profileClickDelegate = EventUtils.bind(self, self.handleProfileClick);

        //Event Handlers
        this.profileImg.addEventListener('click', self.profileClickDelegate);

    }

    handleProfileClick($evt){
        l.debug('this: ', this);
        l.debug('Profile Image click');
        DOMUtils.toggleClass(this.profileOverlayContainer, 'displayNone');
    }

}

module.exports = UIManager;