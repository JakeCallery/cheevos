/**
 * Created by Jake on 1/15/2017.
 */

const shortId = require('shortid');

//TODO: Set up private data in classes
//Look up private data via WeakMaps

class Badge {
    constructor($title, $desc, $iconUrl, $badgeUrl) {
        this.id = shortId.generate();
        this.createdTime = new Date().getTime();
        this.badgeUrl = $badgeUrl || 'badge.png';
        this.iconUrl = $iconUrl || null;
        this.titleText = $title || null;
        this.descText = $desc || null;
    }

    static newBadgeFromDB($dbRecord){
        let badge = new Badge();
        badge.id = $dbRecord.properties.id;
        badge.badgeUrl = $dbRecord.properties.badgeUrl;
        badge.iconUrl = $dbRecord.properties.badgeUrl;
        badge.titleText = $dbRecord.properties.titleText;
        badge.descText = $dbRecord.properties.descText;
        badge.createdTime = $dbRecord.properties.createdTime;
        return Badge;
    }

}

module.exports = Badge;
