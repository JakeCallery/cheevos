/**
 * Created by Jake on 3/11/2017.
 */
import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';

class HeaderUIManager extends EventDispatcher {
    constructor($doc){
        super();

        this.geb = new GlobalEventBus();

        this.doc = $doc;

        l.debug('New Header UI Manager');
    }

    init() {
        l.debug('header ui manager init');

        //UI Elements
        this.profileImg = this.doc.getElementById('profileImg');
        this.profileOverlayContainer = this.doc.getElementById('profileOverlayContainer');
        this.logOutButton = this.doc.getElementById('logOutButton');
        this.manageTeamsButton = this.doc.getElementById('manageTeamsButton');
        this.mainPageButton = this.doc.getElementById('mainPageButton');
        this.notificationsSwitch = this.doc.getElementById('notificationsCheckbox');
        this.notificationsSwitch.disabled = true;

        //Delegates
        let self = this;
        this.profileClickDelegate = EventUtils.bind(self, self.handleProfileClick);
        this.userSubscribedDelegate = EventUtils.bind(self, self.handleUserSubscribed);
        this.userNotSubscribedDelegate = EventUtils.bind(self, self.handleUserNotSubscribed);
        this.notificationsSwitchClickDelegate = EventUtils.bind(self, self.handleNotificationsSwitchClick);
        this.manageTeamsClickDelegate = EventUtils.bind(self, self.handleManageTeamsClick);
        this.mainPageClickDelegate = EventUtils.bind(self, self.handleMainPageClick);
        this.logOutClickDelegate = EventUtils.bind(self, self.handleLogOutClick);

        //Event Handlers
        this.profileImg.addEventListener('click', self.profileClickDelegate);
        this.notificationsSwitch.addEventListener('click', self.notificationsSwitchClickDelegate);
        if(this.manageTeamsButton) this.manageTeamsButton.addEventListener('click', self.manageTeamsClickDelegate);
        if(this.mainPageButton) this.mainPageButton.addEventListener('click', self.mainPageClickDelegate);
        this.logOutButton.addEventListener('click', self.logOutClickDelegate);

        //Global Events
        this.geb.addEventListener('userSubscribed', self.userSubscribedDelegate);
        this.geb.addEventListener('userNotSubscribed', self.userNotSubscribedDelegate);
    }

    handleManageTeamsClick($evt){
        l.debug('Caught Manage Teams Click');
        this.geb.dispatchEvent(new JacEvent('requestManageTeams'));
    }

    handleMainPageClick($evt){
        l.debug('Caught Main Page Click');
        this.geb.dispatchEvent(new JacEvent('requestMainPage'));
    }

    handleLogOutClick($evt){
        l.debug('Caught Log Out Click');
        this.geb.dispatchEvent(new JacEvent('requestLogOut'));
    }

    handleNotificationsSwitchClick($evt) {
        l.debug('Caught Notifications Switch Click');
        this.notificationsSwitch.disabled = true;
        this.geb.dispatchEvent(new JacEvent('requestToggleUserSubscription'));
    }

    handleUserSubscribed($evt){
        l.debug('UI caught user subscribed...');
        this.notificationsSwitch.checked = true;
        this.notificationsSwitch.disabled = false;
    }

    handleUserNotSubscribed($evt){
        l.debug('UI caught user NOT subscribed...');
        this.notificationsSwitch.checked = false;
        this.notificationsSwitch.disabled = false;
    }

    handleProfileClick($evt){
        l.debug('this: ', this);
        l.debug('Profile Image click');
        DOMUtils.toggleClass(this.profileOverlayContainer, 'displayNone');
    }
}

export default HeaderUIManager;