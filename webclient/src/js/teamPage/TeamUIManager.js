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

        //Event Handlers

        //Global Events
        this.geb.addEventListener('newteamlist', self.newTeamListDelegate);

        //Init

    }

    handleNewTeamList($evt){
        l.debug('New Team Data: ', $evt.data);

        for(let i = 0; i < $evt.data.length; i++){
            let teamEl = this.teamUIMaker.createTeamDiv($evt.data[i]);
            this.myTeamsDiv.appendChild(teamEl);
            teamEl.addEventListener('click', ($evt) => {
                l.debug('Team El Clicked: ' + this.getTeamIdFromElementId($evt.currentTarget.id));
            });
        }

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