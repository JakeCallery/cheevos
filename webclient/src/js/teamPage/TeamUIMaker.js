/**
 * Created by Jake on 3/11/2017.
 */
import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';

class TeamUIMaker extends EventDispatcher {
    constructor($doc){
        super();
        this.doc = $doc;
        this.geb = new GlobalEventBus();
    }

    createTeamDiv($teamObj){
        let self = this;

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
            self.geb.dispatchEvent(new JacEvent('requestchangeteamnotifications',
                {
                    teamId: $teamObj.teamId,
                    newTeamNotificationsStatus: $evt.target.checked
                }
            ));
        });

        //Invite User to team
        let inviteButton = this.doc.createElement('button');
        inviteButton.isUIOpen = false;
        inviteButton.innerHTML = 'Invite';
        inviteButton.id = 'inviteButton_' + $teamObj.teamId;
        DOMUtils.addClass(inviteButton, 'inviteToTeamButton');
        DOMUtils.addClass(inviteButton, 'teamItem');
        inviteButton.addEventListener('click', ($evt) => {
            $evt.stopPropagation();
            if(inviteButton.isUIOpen){
                //close old UI
                l.debug('Closing invite UI');
                let parent = container.parentNode;
                let inviteUI = DOMUtils.getDirectChildById(parent, 'inviteContainer_' + $teamObj.teamId);
                inviteUI.closeUI();
                inviteButton.isUIOpen = false;
            } else {
                //open new UI
                l.debug('Opening Invite UI');
                self.geb.dispatchEvent(new JacEvent('requestinviteui', {
                    container: container,
                    teamId: $teamObj.teamId
                }));
                inviteButton.isUIOpen = true;
            }
        });

        self.geb.addEventListener('inviteuiclosing', ($evt) => {
            l.debug('Caught UI Closing: ', $evt.data);
            if($evt.data == $teamObj.teamId){
                l.debug('Setting ui open to false');
                inviteButton.isUIOpen = false;
            }
        });

        //Add to container
        container.appendChild(teamNameEl);
        container.appendChild(isModCheckbox);
        container.appendChild(notificationCheckbox);
        container.appendChild(inviteButton);

        return container;
    }

    createMemberDiv($teamId, $memberObj, $isModerator){
        let self = this;

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
        isBlockedCB.memberId = $memberObj.id;
        DOMUtils.addClass(isBlockedCB, 'memberItem');
        DOMUtils.addClass(isBlockedCB, 'memberItemBlockedCheckbox');
        if($memberObj.isBlocked){
            isBlockedCB.checked = true;
        }

        isBlockedCB.addEventListener('change', ($evt) => {
            l.debug('Caught Blocked Change: ', $evt.target.checked, $evt.target.memberId);
            self.geb.dispatchEvent(new JacEvent('requestblockstatuschange', {
                newIsBlockedStatus: $evt.target.checked,
                memberId: $evt.target.memberId
            }));
        });

        //IsMod / Make Mode / Remove Mod
        let isModCB = this.doc.createElement('input');
        isModCB.type = 'checkbox';
        isModCB.name = 'isModCheckbox';
        isModCB.memberId = $memberObj.id;
        DOMUtils.addClass(isModCB, 'memberItem');
        DOMUtils.addClass(isModCB, 'memberItemModeratorCheckbox');
        if($memberObj.isMod){
            isModCB.checked = true;
        }

        if(!$isModerator){
            isModCB.disabled = true;
        }
        isModCB.addEventListener('change', ($evt) => {
            l.debug('Caught Change: ', $evt.target.checked, $evt.target.memberId);
            self.geb.dispatchEvent(new JacEvent('requestchangemodstatus',
                {
                    newIsModStatus: $evt.target.checked,
                    memberId: $evt.target.memberId,
                    teamId: $teamId
                }
            ));
        });

        //Add to container
        container.appendChild(profileImg);
        container.appendChild(memberNameEl);
        container.appendChild(isBlockedCB);
        container.appendChild(isModCB);

        return container;
    }

    createBlockedMemberDiv($memberObj){
        let self = this;

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
        unblockButton.addEventListener('click', ($evt) => {
            l.debug('Unblock user clicked');
            self.geb.dispatchEvent(new JacEvent('requestunblockuser', $memberObj.id));
        });


        //Add to container
        container.appendChild(profileImg);
        container.appendChild(blockedMemberNameEl);
        container.appendChild(unblockButton);

        return container;
    }

    createInviteDiv($teamId){
        let self = this;

        //Element Container
        let container = this.doc.createElement('div');
        container.id = 'inviteContainer_' + $teamId;
        DOMUtils.addClass(container, 'inviteUserDiv');

        //Label
        let label = this.doc.createElement('p');
        label.innerHTML = 'Email Address to Invite: ';
        DOMUtils.addClass(label, 'inviteLabelP');

        //Email Field:
        let emailField = this.doc.createElement('input');
        emailField.type = 'text';
        DOMUtils.addClass(emailField, 'inviteEmailField');

        //Get Button References
        let sendButton = this.doc.createElement('button');
        let cancelButton = this.doc.createElement('button');

        //Send Button
        sendButton.innerHTML = 'SEND';
        DOMUtils.addClass(sendButton, 'inviteSendButton');
        sendButton.clickHandler = function($evt) {
            l.debug('Send Button Clicked');
            self.geb.dispatchEvent(new JacEvent('requestsendinvite', {
                emailAddress: emailField.value,
                teamId: $teamId
            }));
            container.closeUI();
        };
        sendButton.addEventListener('click', sendButton.clickHandler);

        //Cancel Button
        cancelButton.innerHTML = 'CANCEL';
        DOMUtils.addClass(cancelButton, 'inviteCancelButton');
        cancelButton.clickHandler = function($evt) {
            l.debug('Cancel Button Clicked');
            container.closeUI();
        };
        cancelButton.addEventListener('click', cancelButton.clickHandler);

        container.closeUI = function(){
            l.debug('Closing UI');
            sendButton.removeEventListener('click', sendButton.clickHandler);
            sendButton.clickHandler = undefined;
            cancelButton.removeEventListener('click', cancelButton.clickHandler);
            cancelButton.clickHandler = undefined;
            container.parentNode.removeChild(container);
            self.geb.dispatchEvent(new JacEvent('inviteuiclosing', $teamId));
            container = undefined;
        };

        //Append
        container.appendChild(label);
        container.appendChild(emailField);
        container.appendChild(sendButton);
        container.appendChild(cancelButton);

        return container;

    }

}

export default TeamUIMaker;