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
        container.isModerator = $teamObj.isModerator;
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

    createMemberDiv($memberObj, $isModerator){
        //Element Container
        let container = this.doc.createElement('div');
        container.Id = 'memberDiv_' + $memberObj.id;
        DOMUtils.addClass(container, 'memberDiv');

        //Profile Img
        let profileImg = this.doc.createElement('img');
        profileImg.src = $memberObj.profileImg;
        DOMUtils.addClass(profileImg, 'memberItem');
        DOMUtils.addClass(profileImg, 'memberItemProfileImg');

        //Member Name
        let memberNameEl = this.doc.createElement('p');
        DOMUtils.addClass(memberNameEl, 'memberItem');
        DOMUtils.addClass(memberNameEl, 'memberItemName');
        memberNameEl.innerHTML = $memberObj.name;

        //IsBlocked / Block / Unblock
        let isBlockedCB = this.doc.createElement('input');
        isBlockedCB.type = 'checkbox';
        isBlockedCB.name = 'isBlockedCheckbox';
        DOMUtils.addClass(isBlockedCB, 'memberItem');
        DOMUtils.addClass(isBlockedCB, 'memberItemBlockedCheckbox');
        if($memberObj.isBlocked){
            isBlockedCB.checked = true;
        }

        //IsMod / Make Mode / Remove Mod
        let isModCB = this.doc.createElement('input');
        isModCB.type = 'checkbox';
        isModCB.name = 'isModCheckbox';
        DOMUtils.addClass(isModCB, 'memberItem');
        DOMUtils.addClass(isModCB, 'memberItemModeratorCheckbox');
        if($memberObj.isMod){
            isModCB.checked = true;
        }

        if(!$isModerator){
            isModCB.disabled = true;
        }

        //Add to container
        container.appendChild(profileImg);
        container.appendChild(memberNameEl);
        container.appendChild(isBlockedCB);
        container.appendChild(isModCB);

        return container;
    }

    createBlockedMemberDiv($memberObj){
        //Element Container
        let container = this.doc.createElement('div');
        container.id = 'blockedMemberDiv_' + $memberObj.id;
        DOMUtils.addClass(container, 'blockedMemberDiv');

        //Profile Img
        let profileImg = this.doc.createElement('img');
        profileImg.src = $memberObj.profileImg;
        DOMUtils.addClass(profileImg, 'blockedMemberItem');
        DOMUtils.addClass(profileImg, 'blockedMemberItemProfileImg');

        //Member Name
        let blockedMemberNameEl = this.doc.createElement('p');
        DOMUtils.addClass(blockedMemberNameEl, 'blockedMemberItem');
        DOMUtils.addClass(blockedMemberNameEl, 'blockedMemberItemName');
        blockedMemberNameEl.innerHTML = $memberObj.name;

        //Unblock Button
        let unblockButton = this.doc.createElement('button');
        unblockButton.innerHTML = 'Unblock';
        DOMUtils.addClass(unblockButton, 'blockedMemberItem');
        DOMUtils.addClass(unblockButton, 'blockedMemberUnblockButton');

        //Add to container
        container.appendChild(profileImg);
        container.appendChild(blockedMemberNameEl);
        container.appendChild(unblockButton);

        return container;
    }

}

export default TeamUIMaker;