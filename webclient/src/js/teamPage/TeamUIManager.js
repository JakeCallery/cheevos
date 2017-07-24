/**
 * Created by Jake on 3/11/2017.
 */

import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import HeaderUIManager from 'header/HeaderUIManager';
import TeamUIMaker from 'teamPage/TeamUIMaker';

class TeamUIManager extends EventDispatcher {
    constructor($doc){
        super();

        //Public properties
        this.geb = new GlobalEventBus();
        this.doc = $doc;

        l.debug('new Team Page UI Manager');
    }

    init(){
        l.debug('Team Page UI Manager init');
        let self = this;

        //Managers
        this.headerUIManager = new HeaderUIManager(this.doc);
        this.teamUIMaker = new TeamUIMaker(this.doc);

        //setup header
        this.headerUIManager.init();

        //DOM ELEMENTS
        this.myTeamsDiv = this.doc.getElementById('myTeamsDiv');
        this.blockedUsersDiv = this.doc.getElementById('blockedUsersDiv');
        this.createTeamButton = this.doc.getElementById('createTeamButton');
        this.createTeamNameField = this.doc.getElementById('createTeamNameField');

        //Delegates
        self.newTeamListDelegate = EventUtils.bind(self, self.handleNewTeamList);
        self.newMemberListDelegate = EventUtils.bind(self, self.handleNewMemberList);
        self.newBlockedMemberListDelegate = EventUtils.bind(self, self.handleNewBlockedMemberList);
        self.showInviteUIDelegate = EventUtils.bind(self, self.handleShowInviteUI);
        self.createTeamClickDelegate = EventUtils.bind(self, self.handleCreateTeamButtonClick);

        //Global Events
        this.geb.addEventListener('newteamlist', self.newTeamListDelegate);
        this.geb.addEventListener('newmemberlist', self.newMemberListDelegate);
        this.geb.addEventListener('newblockedmemberlist', self.newBlockedMemberListDelegate);
        this.geb.addEventListener('requestinviteui', self.showInviteUIDelegate);

        //Local Events
        this.createTeamButton.addEventListener('click', self.createTeamClickDelegate);

        //Init

    }

    handleCreateTeamButtonClick($evt){
        l.debug('Caught Create Team Button Click');
        this.geb.dispatchEvent(new JacEvent('requestcreateteam',
            {
                teamName: createTeamNameField.value
            }
        ));
    }

    handleShowInviteUI($evt){
        let inviteUI = this.teamUIMaker.createInviteDiv($evt.data.teamId);
        let teamEl =  this.doc.getElementById('teamDiv_' + $evt.data.teamId);
        DOMUtils.insertAfter(teamEl, inviteUI);
    }

    handleNewBlockedMemberList($evt){
        l.debug('Blocked Members: ', $evt.data.members);
        let self = this;

        //CloseUI on old list
        let blockedMembers = DOMUtils.getChildNodesByClassName(this.blockedUsersDiv, 'blockedMemberDiv');
        for(let b = 0; b < blockedMembers.length; b++){
            blockedMembers[b].closeUI();
        }

        let members = $evt.data.members;
        for(let i = 0; i < members.length; i++){
            let member = members[i];
            let memberEl = this.teamUIMaker.createBlockedMemberDiv(member);
            this.blockedUsersDiv.appendChild(memberEl);
        }
    }

    handleNewMemberList($evt){
        l.debug('Removing old members...');
        let oldMembersDiv = this.doc.getElementById('membersDiv_' + $evt.data.teamId);
        if(oldMembersDiv){ oldMembersDiv.closeUI(); }

        l.debug('Team: ' + $evt.data.teamId);
        l.debug('New Member List: ', $evt.data.members);
        let self = this;
        let teamEl =  this.doc.getElementById('teamDiv_' + $evt.data.teamId);
        let inviteUIEl = this.doc.getElementById('inviteContainer_' + $evt.data.teamId);
        let membersDiv = this.doc.createElement('div');
        membersDiv.id = 'membersDiv_' + $evt.data.teamId;
        membersDiv.closeUI = function(){
            let memberDivs = DOMUtils.getChildNodesByClassName(membersDiv, 'memberDiv');
            l.debug('Closing Member Divs: ', memberDivs.length);
            for(let i = 0; i < memberDivs.length; i++){
                memberDivs[i].closeUI();
            }

            membersDiv.parentNode.removeChild(membersDiv);
        };

        DOMUtils.addClass(membersDiv, 'membersDiv');
        l.debug('inviteUIEL: ', inviteUIEl);
        if(inviteUIEl !== null){
            DOMUtils.insertAfter(inviteUIEl, membersDiv);
        } else {
            DOMUtils.insertAfter(teamEl, membersDiv);
        }


        for(let i = 0; i < $evt.data.members.length; i++){
            let memberEl = this.teamUIMaker.createMemberDiv($evt.data.myId, $evt.data.teamId, $evt.data.members[i], teamEl.isModerator);
            membersDiv.appendChild(memberEl);
        }
    }

    handleNewTeamList($evt){
        l.debug('New Team Data: ', $evt.data);
        let self = this;

        //Close old teamUIs
        let teamDivs = DOMUtils.getChildNodesByClassName(this.myTeamsDiv, 'teamDiv');
        l.debug('Team Divs: ', teamDivs);
        for(let t = 0; t < teamDivs.length; t++){
            let td = teamDivs[t];
            l.debug('TD: ', td);
            //TODO: findNextMembersDiv walks through the whole list and not
            //TODO: just the current TeamDiv
            let membersDiv = this.findNextMembersDiv(td);
            if(membersDiv) {
                l.debug('Closing Members Div: ', membersDiv);
                membersDiv.closeUI();
            }

            if(td){
                l.debug('Closing TD: ', td);
                td.closeUI();
            }

        }

        //Create new teamUIs
        for(let i = 0; i < $evt.data.length; i++){
            let teamEl = this.teamUIMaker.createTeamDiv($evt.data[i]);
            this.myTeamsDiv.appendChild(teamEl);
        }
    }

    expandTeamElement($el){
        l.debug('Expanding Team Element');
        $el.collapsed = false;
    }

    collapseTeamElement($el){
        l.debug('Collapse Team Element');
        //let nodeToRemove = $el.nextSibling;
        //nodeToRemove.parentNode.removeChild(nodeToRemove);
        let membersDivNode = this.findNextMembersDiv($el);
        membersDivNode.closeUI();
        // let oldMembers = DOMUtils.getChildNodesByClassName(membersDivNode, 'memberDiv');
        // for(let i = 0; i < oldMembers.length; i++){
        //     oldMembers[i].closeUI();
        // }
        // membersDivNode.parentNode.removeChild(membersDivNode);
        $el.collapsed = true;
    }

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

    //TODO: THIS IS BUG!!
    //TODO: This walks too far, need to only search in 1 team div
    findNextMembersDiv($rootEl){
        let root = $rootEl;
        while(root.nextSibling){
            l.debug('next sib');
            if(!DOMUtils.hasClass(root.nextSibling,'membersDiv')){
                l.debug('Old root: ', root);
                root = root.nextSibling;
                l.debug('New root: ', root);
            } else {
                l.debug('Found Members Div');
                return root.nextSibling;
            }
        }
        return undefined;
    }

}

export default TeamUIManager;