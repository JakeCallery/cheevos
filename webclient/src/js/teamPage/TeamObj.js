/**
 * Created by Jake on 3/11/2017.
 */

class TeamObj {

    constructor($teamName, $teamId, $memberList, $isModerator, $teamNotifications){
        this.teamName = $teamName;
        this.teamId = $teamId;
        this.memberList = (typeof $memberList !== 'undefined') ? $memberList:false;
        this.isModerator = (typeof $isModerator !== 'undefined') ? $isModerator:false;
        this.teamNotificationsEnabled = (typeof $teamNotifications !== 'undefined') ? $teamNotifications:false;

    }
}

export default TeamObj;
