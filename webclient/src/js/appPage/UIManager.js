/**
 * Created by Jake on 2/20/2017.
 */
import l from 'jac/logger/Logger';
import JACEvent from 'jac/events/JacEvent';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';

class UIManager extends EventDispatcher {
    constructor($dom){
        super();

        //DOM Elements
        this.dom = $dom;
    }

    init(){
        l.debug('UI Manager Init');
        //DOM ELEMENTS
        this.profileImg = this.dom.getElementById('profileImg');

        //Events
        this.profileImg.addEventListener('click', this.handleProfileClick);
    }

    handleProfileClick($evt){
        l.debug('Profile Image click');
    }

}

module.exports = UIManager;