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
        //Team Name
        //Is Moderator
        //Team Notifications Switch
        let container = this.doc.createElement('div');
        DOMUtils.addClass(container, 'teamDiv');

        let teamNameEl = this.doc.createElement('p');
        DOMUtils.addClass(teamNameEl, 'teamItemName');
        DOMUtils.addClass(teamNameEl, 'teamItem');
        teamNameEl.innerHTML = $teamObj.teamName;

        let isModCheckbox = this.doc.createElement('input');
        isModCheckbox.disabled = true;
        isModCheckbox.type = 'checkbox';
        isModCheckbox.name = 'isModCheckbox';
        DOMUtils.addClass(isModCheckbox, 'teamItemIsModCheckbox');
        DOMUtils.addClass(isModCheckbox, 'teamItem');
        if($teamObj.isModerator){
            isModCheckbox.checked = true;
        }

        let notificationCheckbox = this.doc.createElement('input');
        notificationCheckbox.type = 'checkbox';
        notificationCheckbox.name = 'notificationCheckbox';
        DOMUtils.addClass(notificationCheckbox, 'teamItemNotificationCheckbox');
        DOMUtils.addClass(notificationCheckbox, 'teamItem');
        if($teamObj.teamNotificationsEnabled) {
            notificationCheckbox.checked = true;
        }

        container.appendChild(teamNameEl);
        container.appendChild(isModCheckbox);
        container.appendChild(notificationCheckbox);
        return container;
    }

}

export default TeamUIMaker;