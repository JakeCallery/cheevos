/**
 * Created by Jake on 3/11/2017.
 */
import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import UIGEB from 'general/UIGEB';
import UIRequestEvent from 'general/UIRequestEvent';
import shortid from 'shortid';

class TeamUIMaker extends EventDispatcher {
    constructor($doc){
        super();
        this.doc = $doc;
        this.geb = new GlobalEventBus();
        this.uigeb = new UIGEB();
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
        isModCheckbox.name = 'isModCheckbox' + $teamObj.teamId;
        DOMUtils.addClass(isModCheckbox, 'teamItem');
        DOMUtils.addClass(isModCheckbox, 'teamItemIsModCheckbox');

        if($teamObj.isModerator){
            isModCheckbox.checked = true;
        }

        let isModLabel = this.doc.createElement('label');
        isModLabel.for = isModCheckbox.name;
        isModLabel.innerHTML = 'Moderator';
        DOMUtils.addClass(isModLabel, 'teamItem');
        DOMUtils.addClass(isModLabel, 'teamItemIsModLabel');

        //Team Notifications Enabled
        let notificationCheckbox = this.doc.createElement('input');
        notificationCheckbox.type = 'checkbox';
        notificationCheckbox.name = 'notificationCheckbox' + $teamObj.teamId;
        DOMUtils.addClass(notificationCheckbox, 'teamItem');
        DOMUtils.addClass(notificationCheckbox, 'teamItemNotificationCheckbox');
        if($teamObj.teamNotificationsEnabled) {
            notificationCheckbox.checked = true;
        }
        notificationCheckbox.clickHandler = function($evt) {
            $evt.stopPropagation();
            self.geb.dispatchEvent(new JacEvent('requestchangeteamnotifications',
                {
                    teamId: $teamObj.teamId,
                    newTeamNotificationsStatus: $evt.target.checked
                }
            ));
        };
        notificationCheckbox.addEventListener('click', notificationCheckbox.clickHandler);

        let notificationLabel = this.doc.createElement('label');
        notificationLabel.for = notificationCheckbox.name;
        notificationLabel.innerHTML = 'Notifications';
        DOMUtils.addClass(notificationLabel, 'teamItem');
        DOMUtils.addClass(notificationLabel, 'teamItemNotificationLabel');

        //Invite User to team
        let inviteButton = this.doc.createElement('button');
        inviteButton.isUIOpen = false;
        inviteButton.innerHTML = 'Invite';
        inviteButton.id = 'inviteButton_' + $teamObj.teamId;
        DOMUtils.addClass(inviteButton, 'inviteToTeamButton');
        DOMUtils.addClass(inviteButton, 'teamItem');
        inviteButton.clickHandler = function($evt) {
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
        };
        inviteButton.addEventListener('click', inviteButton.clickHandler);

        container.inviteUIClosingHandler = function($evt) {
            l.debug('Caught UI Closing: ', $evt.data);
            if($evt.data === $teamObj.teamId){
                l.debug('Setting ui open to false');
                inviteButton.isUIOpen = false;
            }
        };
        self.geb.addEventListener('inviteuiclosing', container.inviteUIClosingHandler);

        container.clickHandler = function($evt) {
            let el = $evt.currentTarget;
            let teamId = self.getTeamIdFromElementId(el.id);
            l.debug('Team El Clicked: ' + teamId);

            if(el.collapsed){
                //TODO:el.collapsed is also in TeamUIManager (not DRY)
                el.collapsed = false;
                l.debug('Requesting Team Members');
                self.geb.dispatchEvent(new JacEvent('requestmemberlist', teamId));
            } else {
                //self.collapseTeamElement(el);
                //TODO: this is also in collapseTeamElement in TeamUIManager
                el.collapsed = true;
                let membersDivNode = self.findNextMembersDiv(el);
                if(typeof(membersDivNode) !== 'undefined'){ membersDivNode.closeUI(); }
            }
        };
        container.addEventListener('click', container.clickHandler);

        container.closeUI = function(){
            l.debug('Closing TeamDiv UI');
            notificationCheckbox.removeEventListener('click', notificationCheckbox.clickHandler);
            inviteButton.removeEventListener('click', inviteButton.clickHandler);
            self.geb.removeEventListener('inviteuiclosing', container.inviteUIClosingHandler);
            container.removeEventListener('click', container.clickHandler);
            container.parentNode.removeChild(container);
        };

        //Add to container
        container.appendChild(teamNameEl);
        container.appendChild(isModLabel);
        container.appendChild(isModCheckbox);
        container.appendChild(notificationLabel);
        container.appendChild(notificationCheckbox);
        container.appendChild(inviteButton);

        return container;
    }

    createMemberDiv($myId, $teamId, $memberObj, $isModerator){
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
        isBlockedCB.name = 'isBlockedCheckbox_' + $memberObj.id + '_' + shortid.generate();
        isBlockedCB.memberId = $memberObj.id;
        DOMUtils.addClass(isBlockedCB, 'memberItem');
        DOMUtils.addClass(isBlockedCB, 'memberItemBlockedCheckbox');
        if($memberObj.isBlocked){
            isBlockedCB.checked = true;
        }

        isBlockedCB.clickHandler = function($evt) {
            l.debug('Caught Blocked Change: ', $evt.target.checked, $evt.target.memberId);
            $evt.target.disabled = true;
            self.uigeb.dispatchUIEvent('requestblockstatuschange', {
                newIsBlockedStatus: $evt.target.checked,
                memberId: $evt.target.memberId
            }, () => {
                l.debug('-- Caught Block Status Change request complete');
                $evt.target.disabled = false
            });
        };
        isBlockedCB.addEventListener('click', isBlockedCB.clickHandler);

        isBlockedCB.newStatusHandler = function($evt){
            l.debug('newStatusHandler: ', $myId, $evt.data.memberId);
            if($evt.data.memberId === $memberObj.id){
                isBlockedCB.checked = $evt.data.newStatus;
            }
        };
        self.geb.addEventListener('newblockuserstatus', isBlockedCB.newStatusHandler);

        let isBlockedLabel = this.doc.createElement('label');
        isBlockedLabel.for = isBlockedCB.name;
        isBlockedLabel.innerHTML = 'Blocked';
        DOMUtils.addClass(isBlockedLabel, 'memberItem');
        DOMUtils.addClass(isBlockedLabel, 'memberItemBlockedLabel');

        //IsMod / Make Mode / Remove Mod
        let isModCB = this.doc.createElement('input');
        isModCB.type = 'checkbox';
        isModCB.name = 'isModCheckbox_' + $memberObj.id + '_' + shortid.generate();
        isModCB.memberId = $memberObj.id;
        DOMUtils.addClass(isModCB, 'memberItem');
        DOMUtils.addClass(isModCB, 'memberItemModeratorCheckBox');
        if($memberObj.isMod){
            isModCB.checked = true;
        }

        //If I am not team moderator, I cannot make changes to mod status
        if(!$isModerator){
            isModCB.disabled = true;
        }

        //Disable if I am mod / can't remove self as moderator
        if($myId === $memberObj.id){
            isModCB.disabled = true;
        }

        isModCB.clickHandler = function($evt){
            l.debug('Caught click: ', $evt.target.checked, $evt.target.memberId);
            let element = $evt.target;
            element.disabled = true;
            self.uigeb.dispatchUIEvent('requestchangemodstatus',
                {
                    newIsModStatus: $evt.target.checked,
                    memberId: $evt.target.memberId,
                    teamId: $teamId
                },
                () => {
                    l.debug('-- Caught Mod change request complete');
                    element.disabled = false;
                }
            );
        };
        isModCB.addEventListener('click', isModCB.clickHandler);

        let isModLabel = this.doc.createElement('label');
        isModLabel.for = isModCB.name;
        isModLabel.innerHTML = 'Moderator';
        DOMUtils.addClass(isModLabel, 'memberItem');
        DOMUtils.addClass(isModLabel, 'memberItemModeratorLabel');

        container.closeUI = function(){
            l.debug('Closing MemberUI');
            self.geb.removeEventListener('newblockuserstatus', isBlockedCB.changeHandler);
            isBlockedCB.changeHandler = undefined;
            isBlockedCB.removeEventListener('change', isBlockedCB.changeHandler);
            isBlockedCB.changeHandler = undefined;
            isModCB.removeEventListener('change', isModCB.changeHandler);
            isModCB.removeEventListener = undefined;

            container.parentNode.removeChild(container);
            container = undefined;
        };

        //Add to container
        container.appendChild(profileImg);
        container.appendChild(memberNameEl);
        container.appendChild(isBlockedLabel);
        container.appendChild(isBlockedCB);
        container.appendChild(isModLabel);
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
        unblockButton.clickHandler = function($evt) {
            l.debug('-- Unblock user clicked');
            let element = $evt.target;
            element.disabled = true;
            self.uigeb.dispatchUIEvent('requestunblockuser',
                $memberObj.id,
                () => {
                    l.debug('-- Caught Block request complete');
                    element.disabled = false;
                    container.closeUI();
                }
            );
        };
        unblockButton.addEventListener('click', unblockButton.clickHandler);

        //Container Functions
        container.closeUI = function(){
            l.debug('Closing Blocked Member UI');
            unblockButton.removeEventListener('click', unblockButton.clickHandler);
            container.parentNode.removeChild(container);
        };

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
            let element = $evt.target;
            element.disabled = true;
            self.uigeb.dispatchUIEvent('requestsendinvite',
                {
                    emailAddress: emailField.value,
                    teamId: $teamId
                },
                () => {
                    l.debug('-- Caught Send request complete');
                    element.disabled = false;
                }
            );
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

    //TODO: Combine this one with the one from TeamUIManager (util class maybe?)
    getTeamIdFromElementId($elementId){
        let tokens = $elementId.split('_');
        if(tokens.length > 1){
            tokens.shift();
            return tokens.join('_');
        } else {
            l.error('Bad Element ID / Team ID: ', $elementId);
            return null;
        }
    }

    //TODO: Combine this one with the one from TeamUIManager (util class maybe?)
    findNextMembersDiv($rootEl){
        let root = $rootEl;
        while(root.nextSibling){
            if(!DOMUtils.hasClass(root.nextSibling,'membersDiv')){
                root = root.nextSibling;
            } else {
                l.debug('Found Members Div');
                return root.nextSibling;
            }
        }
        return undefined;
    }

}

export default TeamUIMaker;