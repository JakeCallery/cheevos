/**
 * Created by Jake on 3/11/2017.
 */

import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import TeamObj from 'teamPage/TeamObj';
import MemberObj from 'teamPage/MemberObj';

class TeamPageRequestManager extends EventDispatcher {
    constructor(){
        super();
        let self = this;
        l.debug('New Team Page Request Manager');
        this.geb = new GlobalEventBus();
    }

    unblockUser($userIdToUnblock){
        l.debug('Caught Unblock user click');
        fetch('/api/unblockUser', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body:JSON.stringify({
                userIdToUnblock:$userIdToUnblock
            })
        })
        .then(($response) => {
            $response.json()
            .then(($res) => {
                l.debug('Unblock Result: ', $res);
            })
            .catch(($err) => {
                l.error('Unblock error: ', $error);
            })
        })
        .catch(($error) => {
            l.error('unblock error: ', $error);
        });
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
                let memberObjs = [];
                for(let i = 0; i < $res.data.members.length; i++){
                    let obj = $res.data.members[i];
                    let member = new MemberObj(obj.name,
                                                obj.id,
                                                obj.profileImg,
                                                $res.data.teamId,
                                                obj.isBlocked,
                                                obj.isMod);
                    memberObjs.push(member);
                }
                self.geb.dispatchEvent(new JacEvent('newmemberlist', {
                    teamId:$res.data.teamId,
                    members:memberObjs
                }));
            })
            .catch(($err) => {
                l.error('List Memeber Parse Error: ', $err);
            });
        })
        .catch(($error) => {
            l.error('List Members API Error: ', $error);
        });
    }

    //TODO: Set returned limits
    getBlockedMembers(){
        let self = this;
        l.debug('Getting Blocked Members...');
        fetch('/api/listBlockedUsers', {
            method: 'GET',
            credentials: 'include'
        })
        .then(($response) => {
            $response.json()
            .then(($res) => {
                let memberObjs = [];
                for(let i = 0; i < $res.data.blockedUsers.length; i++){
                    let obj = $res.data.blockedUsers[i];
                    let member = new MemberObj(
                        obj.name,
                        obj.id,
                        obj.profileImg,
                        null,
                        null,
                        null
                    );
                    memberObjs.push(member);
                }

                l.debug('Got Blocked Members');
                self.geb.dispatchEvent(new JacEvent('newblockedmemberlist', {
                    members:memberObjs
                }));
            })
            .catch(($err) => {
                l.error('List Blocked Users Error: ', $err);
            });
        })
        .catch(($error) => {
            l.error('List Blocked Users Error: ', $error);
        });
    }

    setModStatus($memberId, $teamId, $newIsModStatus) {
        l.debug('Set Mod Status: ', $teamId, $memberId, $newIsModStatus);
        let apiStr = '';
        if($newIsModStatus === true){
            apiStr = '/api/addModerator';
        } else if ($newIsModStatus === false){
            apiStr = '/api/removeModerator'
        } else {
            l.error('Bad Mod Status: ', $newIsModStatus, true);
        }
        fetch(apiStr, {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                memberId: $memberId,
                teamId: $teamId
            })
        })
        .then(($response) => {
            l.debug('Set Mod Status Response: ', $response);
        })
        .catch(($error) => {
            l.error('Set Mod Status Error: ', $error);
        });
    }
}

export default TeamPageRequestManager;