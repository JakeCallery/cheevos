/**
 * Created by Jake on 3/11/2017.
 */

class MemberObj {
    constructor($name, $id, $teamId, $profileUrl, $isBlocked, $isMod){
        this.name = $name;
        this.id = $id;
        this.teamId = $teamId;
        this.profileImg = $profileUrl;
        this.isBlocked = $isBlocked;
        this.isMod = $isMod;
    }
}

export default MemberObj;