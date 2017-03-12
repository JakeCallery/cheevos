/**
 * Created by Jake on 3/11/2017.
 */

import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import TeamObj from 'teamPage/TeamObj';

class TeamPageRequestManager extends EventDispatcher {
    constructor(){
        super();
        let self = this;
        l.debug('New Team Page Request Manager');
        this.geb = new GlobalEventBus();
    }

    //TODO: Limit number of teams returned
    getTeams(){
        let self = this;
        l.debug('Getting Teams');

        fetch('/api/listMyTeams', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
            })
        })
        .then(($response) => {
            $response.json()
            .then(($res) => {
                l.debug('Get Teams Res: ', $res);
                let moderatedIds = [];
                let teamObjs = [];
                for(let m = 0; m < $res.data.moderatedTeams.length; m++){
                    moderatedIds.push($res.data.moderatedTeams[m].teamId);
                }

                for(let i = 0; i < $res.data.teams.length; i++){
                    let team = $res.data.teams[i];
                    let teamObj = new TeamObj(team.name, team.teamId);
                    if(moderatedIds.indexOf(team.teamId) != -1){
                        teamObj.isModerator = true;
                    }

                    teamObjs.push(teamObj);
                }
                self.geb.dispatchEvent(new JacEvent('newteamlist', teamObjs));
            })
            .catch(($err) => {
                l.error('Get Teams Parse Error: ', $err);
            });

        })
        .catch(($error) => {
            l.debug('List Teams Error: ', $error);
        });
    }

    //TODO: Limit number of members returned
    getMembers($teamId){
        let self = this;
        l.debug('Getting members for: ', $teamId);
        fetch('/api/listMembers', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                teamId: $teamId
            })
        })
        .then(($response) => {
            $response.json()
            .then(($res) => {
                l.debug('List Members API Response: ', $res);
                self.geb.dispatchEvent(new JacEvent('newmemberlist', $res.data.members));
            })
            .catch(($err) => {
                l.error('List Memeber Parse Error: ', $err);
            });
        })
        .catch(($error) => {
            l.error('List Members API Error: ', $error);
        });
    }
}

export default TeamPageRequestManager;