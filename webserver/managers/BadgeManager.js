/**
 * Created by Jake on 1/15/2017.
 */

const uuid = require('node-uuid');
const shortId = require('shortid');
const promiseRetry = require('promise-retry');
const webPush = require('web-push');
const util = require('util');

const db = require('../config/db');
const User = require('../models/User');
const Badge = require('../models/Badge');
const Team = require('../models/Team');
const authConfig = require('../keys/authConfig');

//TODO: this might not be needed with firebase
webPush.setGCMAPIKey(authConfig.gcmAuth.apiKey);

//TODO: Externalize Vapid options
const VAPID_OPTIONS =   {
    vapidDetails: {
        subject: 'http://subvoicestudios.com',
        publicKey: authConfig.pushAuth.publicKey,
        privateKey: authConfig.pushAuth.privateKey
    },
    // 24 hours in seconds.
    TTL: 24 * 60 * 60
};

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
                '<-[rel:sent_to]-(badge:Badge {badgeId:{badgeId}}) ' +
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
            '<-[rel:sent_to]-(badge:Badge {badgeId:{badgeId}}) ' +
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

    static saveBadgeToDB($senderId, $recipientId, $teamId, $badge){
        let session = db.session();
        $badge.badgeId = shortId.generate();
        return session
        .run(
            'MATCH (sender:User {userId:{senderId}}) ' +
            'MATCH (recipient:User {userId:{recipientId}}) ' +
            'MATCH (team:Team {teamId:{teamId}}) ' +
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
                    'MATCH (sender:User {userId:{senderId}}) ' +
                    'MATCH (badge:Badge {badgeId:{badgeId}}) ' +
                    'MATCH (recipient:User {userId:{recipientId}}) ' +
                    'MERGE (badge)-[rel:sent_to]->(recipient) ' +
                    'RETURN badge,recipient,sender',
                    {
                        senderId: $senderId,
                        badgeId: $badge.badgeId,
                        recipientId: $recipientId
                    }
                )
                .then(($dbResult) => {
                    session.close();
                    let numRecords = $dbResult.records.length;
                    if(numRecords === 1){
                        return new Promise((resolve, reject) => {
                            resolve($dbResult);
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
                //just pass along new badge from db
                let session = db.session();
                return session
                .run(
                    'MATCH (sender:User {userId:{senderId}}) ' +
                    'MATCH (recipient:User {userId:{recipientId}}) ' +
                    'MATCH (badge:Badge {badgeId:{badgeId}}) ' +
                    'RETURN badge',
                    {
                        senderId: $senderId,
                        recipientId: $recipientId,
                        badgeId: $badge.badgeId
                    }
                )
                .then(($dbResult) => {
                    return new Promise((resolve, reject) => {
                        resolve($dbResult);
                    });
                })
                .catch(($error) => {
                    return new Promise((resolve, reject) => {
                        console.error('get badge inside of save badge failed: ', $error);
                        reject($error);
                    });
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

    static sendBadgeNotifications($senderId, $senderName,
                                  $recipientId, $recipientName,
                                  $teamId, $badge){
        //Get user list
        return Team.getMembers($teamId)
        .then(($dbResult) => {
            for(let i = 0; i < $dbResult.records.length; i++){
                let memberRecord = $dbResult.records[i].get('member');
                let currentMemberId = memberRecord.properties.userId;

                //TODO: Check for allow team notifications per team (save on relationship?)
                //Check each user if sender is blocked
                User.isUserBlocked(currentMemberId, $senderId)
                .then(($isBlocked) => {
                    if(!$isBlocked) {
                        //Collect endpoints for each user
                        return User.findEndPointsByUserId(memberRecord.properties.userId);
                    } else {
                        //User is blocked, skip...
                        return new Promise((resolve, reject) => {
                            resolve(null);
                        });
                    }
                })
                .then(($endpointDBResult) => {
                    if($endpointDBResult !== null) {
                        //Submit badge notification to webpush

                        //TODO: Green thread this maybe? / Hand off to another process?
                        //Hand off to queue process of some kind?
                        //Might be a good place to play with "yield", or "async"
                        for (let i = 0; i < $endpointDBResult.records.length; i++) {
                            let sub = $endpointDBResult.records[i].get('subscription');
                            let subscription = {
                                endpoint: sub.properties.endpoint,
                                keys: {
                                    p256dh: sub.properties.p256dh,
                                    auth: sub.properties.auth
                                }
                            };

                            //Do Push
                            //TODO: Different notification for team than to the recipient
                            //if this user's id === recipient id, send badge, otherwise send notification
                            //about the badge (title, who it was to, who it was from)
                            let notificationDescObj = null;

                            if(currentMemberId === $recipientId){
                                //Get full badge notification
                                notificationDescObj = {
                                    iconUrl: util.format("%s",$badge.iconUrl),
                                    nameText: util.format("%s (%s)",$badge.titleText, $senderName),
                                    descText: util.format("%s", $badge.descText)
                                };
                            } else if(currentMemberId === $senderId){
                                //Get sent status
                                notificationDescObj = {
                                    iconUrl: util.format("%s",$badge.iconUrl),
                                    nameText: util.format("Sent Badge to: %s",$recipientName),
                                    descText: util.format("%s", $badge.titleText)
                                };
                            } else {
                                //Team notification
                                notificationDescObj = {
                                    iconUrl: util.format("%s",$badge.iconUrl),
                                    nameText: util.format("%s just earned a badge from %s !",$recipientName,$senderName),
                                    descText: util.format("%s", $badge.titleText)
                                };
                            }

                            webPush.sendNotification(
                                subscription,
                                JSON.stringify(notificationDescObj),
                                VAPID_OPTIONS
                            )
                            .then(($result) => {
                                console.log('Push Return Code: ', $result.statusCode);
                                console.log('Push Return Body: ', $result.body);
                                return new Promise((resolve, reject) => {
                                    resolve($result);
                                });
                            })
                            .catch(($error) => {
                                console.error('Push Error: ', $error.message);
                                //Don't kill the whole thing, just move on
                                //TODO: check for bad endpoints and remove them
                                // return new Promise((resolve, reject) => {
                                //     reject($error);
                                // });
                            });
                        }
                    } else {
                        console.log('Skipping notification, user is blocked...');
                    }
                })
                .catch(($error) => {
                    console.error('Send Badge Error: ', $error);
                });
            }
        })
        .catch(($error) => {
            console.error('sendBadgeNotification Error: ', $error);
        });
    }

}

module.exports = BadgeManager;