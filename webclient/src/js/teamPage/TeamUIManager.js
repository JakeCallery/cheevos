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

        //DOM Elements
        //TODO: Move these into init?
        this.doc = $doc;
        this.myTeamsDiv = this.doc.getElementById('myTeamsDiv');

        //Managers
        this.headerUIManager = new HeaderUIManager(this.doc);
        this.teamUIMaker = new TeamUIMaker(this.doc);

        l.debug('new Team Page UI Manager');
    }

    init(){
        l.debug('Team Page UI Manager init');
        let self = this;
        //setup header
        this.headerUIManager.init();

        //DOM ELEMENTS

        //Delegates
        self.newTeamListDelegate = EventUtils.bind(self, self.handleNewTeamList);
        self.newMemberListDelegate = EventUtils.bind(self, self.handleNewMemberList);
        //Event Handlers

        //Global Events
        this.geb.addEventListener('newteamlist', self.newTeamListDelegate);
        this.geb.addEventListener('newmemberlist', self.newMemberListDelegate);

        //Init

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
            let memberEl = this.teamUIMaker.createMemberListDiv($evt.data.members[i], teamEl.isModerator);
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
        //TODO: Fully implement
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