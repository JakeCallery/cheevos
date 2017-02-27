/**
 * Created by Jake on 2/20/2017.
 */
import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import BadgeUIMaker from 'general/BadgeUIMaker'
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';

class UIManager extends EventDispatcher {
    constructor($doc){
        super();

        //Public properties
        this.geb = new GlobalEventBus();

        //DOM Elements
        this.doc = $doc;

        //Managers
        this.badgeUIMaker = new BadgeUIMaker(this.doc);
    }

    init(){
        l.debug('UI Manager Init');

        //DOM ELEMENTS
        this.profileImg = this.doc.getElementById('profileImg');
        this.profileOverlayContainer = this.doc.getElementById('profileOverlayContainer');
        this.badgesContainer = this.doc.getElementById('badgesContainer');
        this.manageTeamsButton = this.doc.getElementById('manageTeamsButton');
        this.logOutButton = this.doc.getElementById('logOutButton');
        this.teamSelectionEl = this.doc.getElementById('teamSelection');
        this.memberSelectionEl = this.doc.getElementById('memberSelection');
        this.previewBadgeButton = this.doc.getElementById('previewBadgeButton');
        this.sendBadgeButton = this.doc.getElementById('sendBadgeButton');
        this.notificationsSwitch = this.doc.getElementById('notificationsCheckbox');
        this.notificationsSwitch.disabled = true;
        this.titleTextField = this.doc.getElementById('titleTextField');
        this.descTextField = this.doc.getElementById('descTextField');

        //Delegates
        let self = this;
        this.profileClickDelegate = EventUtils.bind(self, self.handleProfileClick);
        this.serviceWorkerRegisteredDelegate = EventUtils.bind(self, self.handleSWRegistered);
        this.userSubscribedDelegate = EventUtils.bind(self, self.handleUserSubscribed);
        this.userNotSubscribedDelegate = EventUtils.bind(self, self.handleUserNotSubscribed);
        this.notificationsSwitchClickDelegate = EventUtils.bind(self, self.handleNotificationsSwitchClick);
        this.manageTeamsClickDelegate = EventUtils.bind(self, self.handleManageTeamsClick);
        this.logOutClickDelegate = EventUtils.bind(self, self.handleLogOutClick);
        this.requestMyTeamsResponseDelegate = EventUtils.bind(self, self.handleRequestMyTeamsResponse);
        this.requestTeamMembersResponseDelegate = EventUtils.bind(self, self.handleRequestTeamMembersResponse);
        this.teamSelectionChangeDelegate = EventUtils.bind(self, self.handleTeamSelectionChange);
        this.sendBadgeButtonClickDelegate = EventUtils.bind(self, self.handleSendBadgeClick);
        this.previewBadgeButtonClickDelegate = EventUtils.bind(self, self.handlePreviewBadgeClick);
        this.sendBadgeCompleteDelegate = EventUtils.bind(self, self.handleSendBadgeComplete);
        this.sendBadgeFailedDelegate = EventUtils.bind(self, self.handleSendBadgeFailed);

        //Event Handlers
        this.profileImg.addEventListener('click', self.profileClickDelegate);
        this.notificationsSwitch.addEventListener('click', self.notificationsSwitchClickDelegate);
        this.manageTeamsButton.addEventListener('click', self.manageTeamsClickDelegate);
        this.logOutButton.addEventListener('click', self.logOutClickDelegate);
        this.teamSelectionEl.addEventListener('change', self.teamSelectionChangeDelegate);
        this.sendBadgeButton.addEventListener('click', self.sendBadgeButtonClickDelegate);
        this.previewBadgeButton.addEventListener('click', self.previewBadgeButtonClickDelegate);

        //Gloabl Events
        this.geb.addEventListener('serviceWorkerRegistered', self.serviceWorkerRegisteredDelegate);
        this.geb.addEventListener('userSubscribed', self.userSubscribedDelegate);
        this.geb.addEventListener('userNotSubscribed', self.userNotSubscribedDelegate);

        //Init
        this.populateRecentBadges();
        this.populateTeams();
    }

    handleSendBadgeClick($evt){
        l.debug('Caught Send Badge click');
        this.sendBadgeButton.disabled = true;
        let self = this;
        let data = {
            memberId: self.memberSelectionEl.options[self.memberSelectionEl.selectedIndex].value,
            teamId: self.teamSelectionEl.options[self.teamSelectionEl.selectedIndex].value,
            iconUrl: '/testBadgeIcon.png',
            nameText: this.titleTextField.value,
            descText: this.descTextField.value
        };

        this.geb.addEventListener('sendBadgeComplete', self.sendBadgeCompleteDelegate);
        this.geb.addEventListener('sendBadgeFailed', self.sendBadgeFailedDelegate);
        this.geb.dispatchEvent(new JacEvent('requestSendBadge', data));
    }

    handleSendBadgeComplete($evt){
        l.debug('Caught Send Badge Complete');
        this.sendBadgeButton.disabled = false;
    }

    handleSendBadgeFailed($evt){
        l.debug('Caught Send Badge Failed: ', $evt.data);
        this.sendBadgeButton.disabled = false;
    }

    //TODO: Preview Badge Notification
    handlePreviewBadgeClick($evt){
        l.debug('Caught Preview Badge click');
        alert('Not Yet Implemented');
    }

    handleManageTeamsClick($evt){
        l.debug('Caught Manage Teams Click');
        this.geb.dispatchEvent(new JacEvent('requestManageTeams'));
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

    handleSWRegistered($evt) {
        l.debug('UI Caught SW Registered');
        this.isSWRegistered = true;
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

    populateTeams(){
        l.debug('Populate Teams');
        let self = this;
        this.geb.addEventListener('requestMyTeamsResponse', self.requestMyTeamsResponseDelegate);
        this.geb.dispatchEvent(new JacEvent('requestMyTeams'));
    }

    handleRequestMyTeamsResponse($evt){
        l.debug('My teams: ', $evt.data);
        let self = this;
        this.geb.removeEventListener('requestMyTeamsResponse', self.requestMyTeamsResponseDelegate);

        DOMUtils.removeAllChildren(self.teamSelectionEl);

        for(let i = 0; i < $evt.data.teams.length; i++){
            let team = $evt.data.teams[i];
            let optionEl = self.doc.createElement('option');
            optionEl.value = team.teamId;
            optionEl.textContent = team.name;
            self.teamSelectionEl.appendChild(optionEl);
        }

        self.teamSelectionEl.disabled = false;
        self.handleTeamSelectionChange(null);
    }

    handleTeamSelectionChange($evt){
        l.debug('Team Selection Change');
        let self = this;
        let index = self.teamSelectionEl.selectedIndex;
        this.populateMembers(self.teamSelectionEl.options[index].value,
                             self.teamSelectionEl.options[index].text);
    }

    populateMembers($teamId, $teamName){
        l.debug('Populate Members: ', $teamId, $teamName);
        let self = this;
        let data = {
            teamId:$teamId,
            teamName:$teamName
        };

        this.geb.addEventListener('requestTeamMembersResponse', self.requestTeamMembersResponseDelegate);
        this.geb.dispatchEvent(new JacEvent('requestTeamMembers', data));
    }

    handleRequestTeamMembersResponse($evt){
        l.debug('Team Members: ', $evt.data);
        let self = this;
        this.geb.removeEventListener('requestTeamMembersResponse', self.requestTeamMembersResponseDelegate);

        DOMUtils.removeAllChildren(self.memberSelectionEl);

        //Populate selection here
        for(let i = 0 ; i < $evt.data.members.length; i++){
            let member = $evt.data.members[i];
            let optionEl = self.doc.createElement('option');
            optionEl.value = member.id;
            optionEl.textContent = member.name;
            self.memberSelectionEl.appendChild(optionEl);
        }

        self.memberSelectionEl.disabled = false;
    }

    //TODO: Move Populate Badges Fetch to appPage.js
    populateRecentBadges(){
        l.debug('Populate Recent Badges');
        fetch('api/listMyBadges', {
            method:'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
            })
        })
        .then(($response) => {
            $response.json()
            .then(($res) => {
                l.debug($res);
                let badges = $res.data.badges;
                for(let i = 0; i < badges.length; i++){
                    let badge = badges[i];
                    this.badgesContainer.appendChild(
                        this.badgeUIMaker.createBadgeDiv(
                            badge.titleText,
                            badge.descText,
                            badge.senderName,
                            badge.teamName,
                            badge.iconUrl
                        )
                    );
                }
            })
            .catch(($error) => {
                l.error('ERROR: ', $error);
            })
        })
        .catch(($error) => {
            l.error('FETCH ERROR: ', $error);
        });
    }

    handleProfileClick($evt){
        l.debug('this: ', this);
        l.debug('Profile Image click');
        DOMUtils.toggleClass(this.profileOverlayContainer, 'displayNone');
    }

}

export default UIManager;