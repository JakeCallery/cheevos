/**
 * Created by Jake on 3/11/2017.
 */

import l from 'jac/logger/Logger';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import TeamObj from 'teamPage/TeamObj';
import MemberObj from 'teamPage/MemberObj';
import Status from 'general/Status';

class TeamPageRequestManager extends EventDispatcher {
    constructor(){
        super();
        let self = this;
        l.debug('New Team Page Request Manager');
        this.geb = new GlobalEventBus();
    }
    //TODO: Return actual status, not Status.SUCCESS
    //TODO: Limit number of teams returned
    getTeams(){
        let self = this;
        return new Promise((resolve, reject) => {
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
                return $response.json();
            })
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

                    teamObj.teamNotificationsEnabled = team.teamNotificationsEnabled;

                    if(moderatedIds.indexOf(team.teamId) !== -1){
                        teamObj.isModerator = true;
                    }

                    teamObjs.push(teamObj);
                }
                resolve({
                    status: $res.status,
                    data: teamObjs
                });
            })
            .catch(($error) => {
                l.error('List Teams Error: ', $error);
                reject({
                    status: Status.ERROR,
                    data: $error
                });
            });
        });
    }

    //TODO: Limit number of members returned
    getMembers($teamId){
        let self = this;
        l.debug('Getting members for: ', $teamId);

        return new Promise((resolve, reject) => {
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
                return $response.json();
            })
            .then(($res) => {
                l.debug('List Members API Response: ', $res);
                if($res.status === "SUCCESS"){
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

                    resolve({
                        status: Status.SUCCESS,
                        data:{
                            myId: $res.data.myId,
                            teamId:$res.data.teamId,
                            members:memberObjs
                        }
                    });
                } else {
                    l.debug('Rejecting: ', $res.error);
                    reject({
                        status: Status.ERROR,
                        error: $res.error
                    });
                }
            })
            .catch(($error) => {
                l.error('List Members API Error: ', $error);
                reject({
                    status: Status.ERROR,
                    data: $error
                });
            });
        });
    }

    //TODO: Set returned limits
    getBlockedMembers(){
        let self = this;
        l.debug('Getting Blocked Members...');
        return new Promise((resolve, reject) => {
            fetch('/api/listBlockedUsers', {
                method: 'GET',
                credentials: 'include'
            })
            .then(($response) => {
                return $response.json();
            })
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
                resolve({
                    status: Status.SUCCESS,
                    data: {
                        members: memberObjs
                    }
                });
            })
            .catch(($error) => {
                l.error('List Blocked Users Error: ', $error);
                reject({
                    status: Status.ERROR,
                    data: $error
                })
            });
        });
    }

    setBlockStatus($memberId, $newIsBlockedStatus){
        let self = this;
        return new Promise((resolve, reject) => {
            l.debug('Set Blocked Status: ', $memberId, $newIsBlockedStatus);
            let apiStr = '';
            if($newIsBlockedStatus === true){
                apiStr = '/api/blockUser';
            } else if ($newIsBlockedStatus === false){
                apiStr = '/api/unblockUser'
            } else {
                l.error('Bad Block User Status: ', $newIsBlockedStatus, true);
            }

            fetch(apiStr, {
                method: 'POST',
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    memberId: $memberId
                })
            })
            .then(($response) => {
                return $response.json()
            })
            .then(($res) => {
                l.debug('Change Block User Status Response: ', $res);
                resolve({
                    status: Status.SUCCESS,
                    data: {
                        memberId: $memberId,
                        newStatus: $newIsBlockedStatus
                    }
                });
            })
            .catch(($error) => {
                l.error('Change Block User Status Error: ', $error);
                reject({
                    status: Status.ERROR,
                    data: $error
                });
            });
        });
    }

    setModStatus($memberId, $teamId, $newIsModStatus) {
        l.debug('Set Mod Status: ', $teamId, $memberId, $newIsModStatus);
        return new Promise((resolve, reject) => {
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
                return $response.json();
            })
            .then(($response) => {
                l.debug('Set Mod Status Response: ', $response);
                resolve({
                    status: $response.status,
                    data: $response.data
                });
            })
            .catch(($error) => {
                l.error('Set Mod Status Error: ', $error);
                reject({
                    status: Status.ERROR,
                    data: $error
                });
            });
        });
    }

    setTeamNotificationsStatus($teamId, $newTeamNotificationsStatus) {
        return new Promise((resolve, reject) => {
            let apiStr = '';
            if($newTeamNotificationsStatus === true){
                apiStr = '/api/enableTeamNotifications';
            } else if($newTeamNotificationsStatus === false){
                apiStr = '/api/disableTeamNotifications';
            } else {
                l.error('Bad Notifications Status: ', $newTeamNotificationsStatus, true);
            }
            fetch(apiStr, {
                method:'POST',
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body:JSON.stringify({
                    teamId: $teamId
                })
            })
            .then(($response) => {
                return $response.json();
            })
            .then(($res) => {
                l.debug('Change Team Notifications Res: ', $res);
                resolve({
                    status: $res.status,
                    data: $res.data
                });
            })
            .catch(($error) => {
                l.debug('Change Team Notrifications Error: ', $error);
                reject({
                    status: Status.ERROR,
                    data: $error
                });
            });
        });
    }

    sendTeamInvite($emailAddress, $teamId){
        return new Promise((resolve, reject) => {
            fetch('/api/inviteMember', {
                method: 'POST',
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    email: $emailAddress,
                    teamId: $teamId
                })
            })
            .then(($response) => {
                return $response.json();
            })
            .then(($res) => {
                l.debug('Invite Response: ', $res);
                resolve({
                    status: $res.status,
                    data: $res.data
                });
            })
            .catch(($error) => {
                l.error('Invite Error: ', $error);
                reject({
                    status: Status.ERROR,
                    data: $error
                });
            });
        });
    }

    createTeam($teamName) {
        let self = this;
        return new Promise((resolve, reject) => {
            l.debug('Creating Team');
            fetch('/api/createTeam', {
                method: 'POST',
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    teamName: $teamName
                })
            })
            .then(($response) => {
                return $response.json();
            })
            .then(($res) => {
                l.debug('Create Team Response: ', $res);
                resolve({
                    status: $res.status,
                    data: $res.data
                })
            })
            .catch(($error) => {
                l.error('Create Team Error: ', $error);
                reject({
                    status: Status.ERROR,
                    data: $error
                });
            });
        });
    }

    removeMember($memberId, $teamId) {
        return new Promise((resolve, reject) => {
            l.debug('Removing member');
            fetch('/api/removeMemberFromTeam', {
                method: 'DELETE',
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
                return $response.json();
            })
            .then(($res) => {
                l.debug('Remove Member Response: ', $res);
                resolve({
                    status: $res.status,
                    data: $res.data
                });
            })
            .catch(($error) => {
                l.error('Remove Member Error');
                reject({
                    status: Status.ERROR,
                    data: $error
                });
            });
        });
    }

    removeTeam($teamId) {
        return new Promise((resolve, reject) => {
            l.debug('Removing Team: ', $teamId);
            fetch('/api/removeTeam', {
                method: 'DELETE',
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    teamId:$teamId
                })
            })
            .then(($response) => {
                return $response.json();
            })
            .then(($res) => {
                l.debug('Remove Team Response: ', $res);
                resolve({
                    status: $res.status,
                    data: $res.data
                });
            })
            .catch(($error) => {
                l.error('Remove Team Error');
                reject({
                    status: Status.ERROR,
                    data: $error
                });
            });
        });
    }
}

export default TeamPageRequestManager;