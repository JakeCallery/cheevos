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
import HeaderUIManager from 'header/HeaderUIManager';

class UIManager extends EventDispatcher {
    constructor($doc){
        super();

        //Public properties
        this.geb = new GlobalEventBus();

        //DOM Elements
        this.doc = $doc;

        //Managers
        this.badgeUIMaker = new BadgeUIMaker(this.doc);
        this.headerUIManager = new HeaderUIManager(this.doc);
    }

    init(){
        l.debug('***** UI Manager Init *******');

        //setup header
        this.headerUIManager.init();

        //DOM ELEMENTS
        this.badgesContainer = this.doc.getElementById('badgesContainer');
        this.teamSelectionEl = this.doc.getElementById('teamSelection');
        this.memberSelectionEl = this.doc.getElementById('memberSelection');
        this.previewBadgeButton = this.doc.getElementById('previewBadgeButton');
        this.sendBadgeButton = this.doc.getElementById('sendBadgeButton');
        this.titleTextField = this.doc.getElementById('titleTextField');
        this.descTextField = this.doc.getElementById('descTextField');

        //Delegates
        let self = this;
        this.serviceWorkerRegisteredDelegate = EventUtils.bind(self, self.handleSWRegistered);
        this.requestMyTeamsResponseDelegate = EventUtils.bind(self, self.handleRequestMyTeamsResponse);
        this.requestTeamMembersResponseDelegate = EventUtils.bind(self, self.handleRequestTeamMembersResponse);
        this.teamSelectionChangeDelegate = EventUtils.bind(self, self.handleTeamSelectionChange);
        this.sendBadgeButtonClickDelegate = EventUtils.bind(self, self.handleSendBadgeClick);
        this.previewBadgeButtonClickDelegate = EventUtils.bind(self, self.handlePreviewBadgeClick);
        this.sendBadgeCompleteDelegate = EventUtils.bind(self, self.handleSendBadgeComplete);
        this.sendBadgeFailedDelegate = EventUtils.bind(self, self.handleSendBadgeFailed);
        this.newRecentBadgesDelegate = EventUtils.bind(self, self.handleNewRecentBadges);
        this.requestMyTeamsDelegate = EventUtils.bind(self, self.handleRequestMyTeams);
        this.newTeamsDelegate = EventUtils.bind(self, self.handleNewTeams);
        this.newMembersDelegate = EventUtils.bind(self, self.handleNewMembers);

        //Event Handlers
        this.teamSelectionEl.addEventListener('change', self.teamSelectionChangeDelegate);
        this.sendBadgeButton.addEventListener('click', self.sendBadgeButtonClickDelegate);
        this.previewBadgeButton.addEventListener('click', self.previewBadgeButtonClickDelegate);

        //Global Events
        this.geb.addEventListener('serviceworkerregistered', self.serviceWorkerRegisteredDelegate);
        this.geb.addEventListener('newrecentbadges', self.newRecentBadgesDelegate);
        this.geb.addEventListener('requestmyteams', self.requestMyTeamsDelegate);
        this.geb.addEventListener('newteams', self.newTeamsDelegate);
        this.geb.addEventListener('newmembers', self.newMembersDelegate);

        //Init
        //TODO: these need moved into appPage.js
        //this.populateTeams();
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

        this.geb.dispatchEvent(new JacEvent('requestsendbadge', data));
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

    handleSWRegistered($evt) {
        l.debug('UI Caught SW Registered');
        this.isSWRegistered = true;
    }

    handleRequestMyTeams($evt){
        this.teamSelectionEl.disabled = true;
        this.memberSelectionEl.disabled = true;
    }

    handleNewTeams($evt){
        l.debug('My teams: ', $evt.data);
        let self = this;
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
        let index = this.teamSelectionEl.selectedIndex;
        this.memberSelectionEl.disabled = true;
        this.geb.dispatchEvent(new JacEvent('requestteammembers', {
            teamId: this.teamSelectionEl.options[index].value,
            teamName: this.teamSelectionEl.options[index].text
        }));
    }

/*
    populateMembers($teamId, $teamName){
        l.debug('Populate Members: ', $teamId, $teamName);
        let self = this;
        let data = {
            teamId:$teamId,
            teamName:$teamName
        };

        this.geb.addEventListener('requestteammembersresponse', self.requestTeamMembersResponseDelegate);
        this.geb.dispatchEvent(new JacEvent('requestteammembers', data));
    }
*/

    handleNewMembers($evt){
        l.debug('****** Team Members: ', $evt.data);
        DOMUtils.removeAllChildren(this.memberSelectionEl);
        //Populate selection here
        for(let i = 0 ; i < $evt.data.members.length; i++){
            let member = $evt.data.members[i];
            let optionEl = this.doc.createElement('option');
            optionEl.value = member.id;
            optionEl.textContent = member.name;
            this.memberSelectionEl.appendChild(optionEl);
        }

        this.memberSelectionEl.disabled = false;
    }

    handleNewRecentBadges($evt){
        //TODO: Clear old UI first
        l.debug('Caught new recent badges');
        let badges = $evt.data;
        for (let i = 0; i < badges.length; i++) {
            let badge = badges[i];
            this.badgesContainer.appendChild(
                this.badgeUIMaker.createBadgeDiv(
                    badge.titleText,
                    badge.descText,
                    badge.senderName,
                    badge.senderId,
                    badge.teamName,
                    badge.iconUrl
                )
            );
        }
    }

}

export default UIManager;