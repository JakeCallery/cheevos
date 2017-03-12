/**
 * Created by Jake on 3/11/2017.
 */
import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';

class TeamUIMaker extends EventDispatcher {
    constructor($doc){
        super();

        this.doc = $doc;
    }

    createTeamDiv($teamObj){
        //Element Container
        let container = this.doc.createElement('div');
        container.id = 'teamDiv_' + $teamObj.teamId;
        container.collapsed = true;
        DOMUtils.addClass(container, 'teamDiv');

        //Team Name
        let teamNameEl = this.doc.createElement('p');
        DOMUtils.addClass(teamNameEl, 'teamItemName');
        DOMUtils.addClass(teamNameEl, 'teamItem');
        teamNameEl.innerHTML = $teamObj.teamName;

        //Is Moderator
        let isModCheckbox = this.doc.createElement('input');
        isModCheckbox.disabled = true;
        isModCheckbox.type = 'checkbox';
        isModCheckbox.name = 'isModCheckbox';
        DOMUtils.addClass(isModCheckbox, 'teamItemIsModCheckbox');
        DOMUtils.addClass(isModCheckbox, 'teamItem');
        if($teamObj.isModerator){
            isModCheckbox.checked = true;
        }

        //Team Notifications Enabled
        let notificationCheckbox = this.doc.createElement('input');
        notificationCheckbox.type = 'checkbox';
        notificationCheckbox.name = 'notificationCheckbox';
        DOMUtils.addClass(notificationCheckbox, 'teamItemNotificationCheckbox');
        DOMUtils.addClass(notificationCheckbox, 'teamItem');
        if($teamObj.teamNotificationsEnabled) {
            notificationCheckbox.checked = true;
        }
        notificationCheckbox.addEventListener('click', ($evt) => {
            $evt.stopPropagation();
        });

        //Invite User to team
        let inviteButton = this.doc.createElement('button');
        inviteButton.innerHTML = 'Invite';
        inviteButton.id = 'inviteButton_' + $teamObj.teamId;
        DOMUtils.addClass(inviteButton, 'inviteToTeamButton');
        DOMUtils.addClass(inviteButton, 'teamItem');
        inviteButton.addEventListener('click', ($evt) => {
            $evt.stopPropagation();
        });

        //Add to container
        container.appendChild(teamNameEl);
        container.appendChild(isModCheckbox);
        container.appendChild(notificationCheckbox);
        container.appendChild(inviteButton);

        return container;
    }

    createMemberListDiv($memberList){

    }

}

export default TeamUIMaker;