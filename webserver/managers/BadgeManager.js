/**
 * Created by Jake on 1/15/2017.
 */

const db = require('../config/db');
const uuid = require('node-uuid');

class BadgeManager {
    constructor(){
        //nothing yet
    }

    static saveBadgeToDB($senderId, $recipientId, $badge){
        let session = db.session();
        return session
        .run(
            'MATCH (sender:User {googleId:{senderId}}) ' +
            'MATCH (recipient:User {googleId:{recipientId}}) ' +
            'MERGE (' +
            'badge:Badge {' +
            'id:{badgeId},' +
            'badgeUrl:{badgeUrl},' +
            'iconUrl:{iconUrl},' +
            'titleText:{titleText},' +
            'descText:{descText},' +
            'createdTime:{createdTime}' +
            '}) ' +
            'MERGE (badge)-[:sent_to]->(recipient) ' +
            'MERGE (badge)<-[:sent_from]-(sender) ' +
            'RETURN badge',
            {
                senderId: $senderId,
                recipientId: $recipientId,
                badgeId: $badge.id,
                badgeUrl: $badge.badgeUrl,
                iconUrl: $badge.iconUrl,
                titleText: $badge.titleText,
                descText: $badge.descText,
                createdTime: $badge.createdTime
            }
        )
        .then(($dbResult) => {
            session.close();
            if($dbResult.records.length > 0) {
                console.log('Num Badges Returned, (should be 1): ', $dbResult.records.length);
                return new Promise((resolve, reject) => {
                    resolve($dbResult);
                });
            } else {
                return new Promise((resolve, reject) => {
                    reject('No Badges Created');
                });
            }
        })
        .catch(($error) => {
            session.close();
            return new Promise((resolve, reject) => {
                reject($error);
            });
        });
    }
}

module.exports = BadgeManager;