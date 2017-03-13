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

        //Delegates
        self.newTeamListDelegate = EventUtils.bind(self, self.handleNewTeamList);
        self.newMemberListDelegate = EventUtils.bind(self, self.handleNewMemberList);
        self.newBlockedMemberListDelegate = EventUtils.bind(self, self.handleNewBlockedMemberList);


        //Global Events
        this.geb.addEventListener('newteamlist', self.newTeamListDelegate);
        this.geb.addEventListener('newmemberlist', self.newMemberListDelegate);
        this.geb.addEventListener('newblockedmemberlist', self.newBlockedMemberListDelegate);

        //Init

    }

    handleNewBlockedMemberList($evt){
        l.debug('Blocked Members: ', $evt.data.members);
        let self = this;

        let members = $evt.data.members;
        for(let i = 0; i < members.length; i++){
            let member = members[i];
            let memberEl = this.teamUIMaker.createBlockedMemberDiv(member);
            this.blockedUsersDiv.appendChild(memberEl);
        }
    }

    handleNewMemberList($evt){
        l.debug('Team: ' + $evt.data.teamId);
        l.debug('New Member List: ', $evt.data.members);
        let self = this;
        let teamEl =  this.doc.getElementById('teamDiv_' + $evt.data.teamId);
        let membersEl = this.doc.createElement('div');
        DOMUtils.addClass(membersEl, 'membersDiv');
        DOMUtils.insertAfter(teamEl, membersEl);

        for(let i = 0; i < $evt.data.members.length; i++){
            let memberEl = this.teamUIMaker.createMemberDiv($evt.data.members[i], teamEl.isModerator);
            membersEl.appendChild(memberEl);
        }
    }

    handleNewTeamList($evt){
        l.debug('New Team Data: ', $evt.data);
        let self = this;
        for(let i = 0; i < $evt.data.length; i++){
            let teamEl = this.teamUIMaker.createTeamDiv($evt.data[i]);

            this.myTeamsDiv.appendChild(teamEl);

            teamEl.addEventListener('click', ($evt) => {
                let el = $evt.currentTarget;
                let teamId = this.getTeamIdFromElementId(el.id);
                l.debug('Team El Clicked: ' + teamId);

                if(el.collapsed){
                    self.expandTeamElement(el);
                    l.debug('Requesting Team Members');
                    self.geb.dispatchEvent(new JacEvent('requestmemberlist', teamId));
                } else {
                    self.collapseTeamElement(el);
                }
            });

        }

    }

    expandTeamElement($el){
        l.debug('Expanding Team Element');
        $el.collapsed = false;
    }

    collapseTeamElement($el){
        l.debug('Collapse Team Element');
        let nodeToRemove = $el.nextSibling;
        nodeToRemove.parentNode.removeChild(nodeToRemove);
        $el.collapsed = true;
    }

    getTeamIdFromElementId($elementId){
        let tokens = $elementId.split('_');
        if(tokens.length > 1){
            return tokens[tokens.length-1];
        } else {
            l.error('Bad Element ID / Team ID: ', $elementId);
            return null;
        }

    }

}

export default TeamUIManager;