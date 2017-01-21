/**
 * Created by Jake on 1/15/2017.
 */

const db = require('../config/db');
const uuid = require('node-uuid');
const User = require('../models/User');
const Badge = require('../models/Badge');
const shortId = require('shortid');
const promiseRetry = require('promise-retry');

class BadgeManager {
    constructor(){
        //nothing yet
        //All static, could be a singleton
    }

    static removeBadgeCompletely($memberId, $badgeId){
        let session = db.session();
        console.log('Removing Badge Completely: ', $memberId, ' / ', $badgeId);
        //TODO: make sure only owner of badge can remove it
        return session
            .run(
                'MATCH (user:User {userId:{userId}})' +
                '<-[rel:sent_to]-(badge:Badge {id:{badgeId}}) ' +
                'DETACH DELETE badge ' +
                'RETURN badge',
                {
                    userId: $memberId,
                    badgeId: $badgeId
                }
            )
            .then(($dbResult) => {
                session.close();
                if($dbResult.records.length === 1) {
                    console.log('Removed Badge: ', $dbResult);
                    return new Promise((resolve, reject) => {
                        resolve($dbResult);
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        reject('Expected 1 badge record, received: ', $dbResult.records.length);
                    });
                }
            })
            .catch(($error) => {
                return new Promise((resolve, reject) => {
                    reject($error);
                });
            })
    }

    static removeBadgeForUser($memberId, $badgeId){
        let session = db.session();
        return session
        .run(
            'MATCH (user:User {userId:{userId}})' +
            '<-[rel:sent_to]-(badge:Badge {id:{badgeId}}) ' +
            'DELETE rel ' +
            'RETURN badge,rel',
            {
                userId: $memberId,
                badgeId: $badgeId
            }
        )
        .then(($dbResult) => {
            session.close();
            if($dbResult.records.length === 1) {
                console.log('Removed Link to Badge: ', $dbResult);
                return new Promise((resolve, reject) => {
                    resolve($dbResult);
                });
            } else {
                return new Promise((resolve, reject) => {
                    reject('Expected 1 badge record, received: ', $dbResult.records.length);
                });
            }
        })
        .catch(($error) => {
            return new Promise((resolve, reject) => {
                reject($error);
            });
        })
    }

    static saveBadgeToDB($senderId, $recipientId, $teamName, $teamId, $badge){
        let session = db.session();
        $badge.badgeId = shortId.generate();
        return session
        .run(
            'MATCH (sender:User {userId:{senderId}}) ' +
            'MATCH (recipient:User {userId:{recipientId}}) ' +
            'MATCH (team:Team {teamName:{teamName},teamId:{teamId}}) ' +
            'MATCH (sender)-[:member_of]->(team)<-[:member_of]-(recipient) ' +
            'MERGE (' +
            'badge:Badge {' +
            'badgeId:{badgeId},' +
            'badgeUrl:{badgeUrl},' +
            'iconUrl:{iconUrl},' +
            'titleText:{titleText},' +
            'descText:{descText},' +
            'createdTime:{createdTime},' +
            'recipientId:{recipientId}' +
            '}) ' +
            'MERGE (badge)<-[:sent_from]-(sender) ' +
            'MERGE (badge)-[:part_of_team]->(team) ' +
            'RETURN badge',
            {
                senderId: $senderId,
                recipientId: $recipientId,
                badgeId: $badge.badgeId,
                badgeUrl: $badge.badgeUrl,
                iconUrl: $badge.iconUrl,
                titleText: $badge.titleText,
                descText: $badge.descText,
                createdTime: $badge.createdTime,
                teamName: $teamName,
                teamId: $teamId
            }
        )
        .then(($dbResult) => {
            session.close();
            let numRecords = $dbResult.records.length;
            if(numRecords === 1) {
                console.log('Num Badges Returned, (should be 1): ' + numRecords);
                return User.isUserBlocked($recipientId, $senderId);
            } else {
                return new Promise((resolve, reject) => {
                    reject('Expected 1 badge record created, but received: ' + numRecords);
                });
            }
        })
        .then(($isBlocked) => {

            if(!$isBlocked) {
                let session = db.session();
                return session
                .run(
                    'MATCH (badge:Badge {badgeId:{badgeId}}) ' +
                    'MATCH (recipient:User {userId:{recipientId}}) ' +
                    'MERGE (badge)-[rel:sent_to]->(recipient) ' +
                    'RETURN badge, rel',
                    {
                        badgeId: $badge.badgeId,
                        recipientId: $recipientId
                    }
                )
                .then(($dbResult) => {
                    session.close();
                    let numRecords = $dbResult.records.length;
                    if(numRecords === 1){
                        return new Promise((resolve, reject) => {
                            resolve($isBlocked);
                        });
                    } else if(numRecords > 1) {
                        return new Promise((resolve, reject) => {
                            reject('Expected 1 record, got: ' + numRecords);
                        });
                    } else {
                        return new Promise((resolve, reject) => {
                            reject('Expected 1 badge returned, got: ' + numRecords);
                        });
                    }
                })
                .catch(($error) => {
                    session.close();
                    return new Promise((resolve, reject) => {
                        reject($error);
                    });
                });

            } else {
                //user is blocked, don't hook badge up to recipient
                return new Promise((resolve, reject) => {
                    resolve($isBlocked);
                });
            }
        })
        .catch(($error) => {
            session.close();
            console.log('Save Badge Error: ', $error);
            return new Promise((resolve, reject) => {
                reject($error);
            });
        });
    }
}

module.exports = BadgeManager;