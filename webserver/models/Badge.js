/**
 * Created by Jake on 1/15/2017.
 */

const shortId = require('shortid');

//TODO: Set up private data in classes
//Look up private data via WeakMaps

class Badge {
    constructor($recipientId, $title, $desc, $iconUrl, $badgeUrl) {
        //this.badgeId = shortId.generate();
        this.createdTime = new Date().getTime();
        this.badgeUrl = $badgeUrl || 'badge.png';
        this.iconUrl = $iconUrl || null;
        this.titleText = $title || null;
        this.descText = $desc || null;
        this.recipientId = $recipientId || null;
    }

    json(){
        return {
            badgeId: this.badgeId,
            createdTime: this.createdTime,
            badgeUrl: this.badgeUrl,
            iconUrl: this.iconUrl,
            titleText: this.titleText,
            descText: this.descText,
            recipientId: this.recipientId
        }
    }

    static newBadgeFromDB($dbRecord){
        let badge = new Badge();
        badge.badgeId = $dbRecord.properties.badgeId;
        badge.badgeUrl = $dbRecord.properties.badgeUrl;
        badge.iconUrl = $dbRecord.properties.iconUrl;
        badge.titleText = $dbRecord.properties.titleText;
        badge.descText = $dbRecord.properties.descText;
        badge.createdTime = $dbRecord.properties.createdTime;
        badge.recipientId = $dbRecord.properties.recipientId;
        return badge;
    }
}

module.exports = Badge;
