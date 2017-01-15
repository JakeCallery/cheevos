/**
 * Created by Jake on 12/28/2016.
 */
'use strict';

const db = require('../config/db');
const Team = require('../models/Team');

class User {
    constructor($data) {
        this.data = $data || {};
    }

    getAllMyBadges() {
        console.log('Getting ALL badges...');
        let session = db.session();
        return session
        .run(
            'MATCH (user:User {googleId:{googleId}})' +
            '<-[:sent_to]-(badge:Badge) ' +
            'RETURN badge',
            {
                googleId:this.id
            }
        )
        .then(($dbResult) => {
            session.close();
            return new Promise((resolve, reject) => {
                resolve($dbResult);
            });
        })
        .catch(($error) => {
            session.close();
            return new Promise((resolve, reject) => {
                reject($error);
            });
        });
    }

    getMyBadgesOnTeam($teamName, $teamId) {
        console.log('Getting my badges on team...');
        let session = db.session();
        return session
            .run(
                'MATCH (user:User {googleId:{googleId}})' +
                '-[:member_of]->(team:Team {teamName:{teamName},teamId:{teamId}})' +
                '<-[:sent_to]-(badge:Badge) ' +
                'RETURN badge',
                {
                    googleId:this.id,
                    teamName:$teamname,
                    teamId:$teamId
                }
            )
            .then(($dbResult) => {
                session.close();
                return new Promise((resolve, reject) => {
                    resolve($dbResult);
                });
            })
            .catch(($error) => {
                session.close();
                return new Promise((resolve, reject) => {
                    reject($error);
                });
            });

    }

    getMyTeams() {
        console.log('Getting My Teams...');
        let session = db.session();
        return session
        .run(
            'MATCH (user:User {googleId:{googleId}}) ' +
            'MATCH (user)-[:member_of]->(team) ' +
            'MATCH (user)-[:moderates]->(moderatedteam) ' +
            'RETURN team, moderatedteam',
            {
                googleId: this.id
            }
        )
        .then(($dbResult) => {
            session.close();
            return new Promise((resolve, reject) => {
                if($dbResult.records.length > 0){
                    resolve($dbResult);
                } else {
                    reject('List My Teams error, no records returned');
                }

            });
        })
        .catch(($error) => {
            session.close();
            console.log('List My Teams error: ', $error);
            return new Promise((resolve, reject) => {
                reject($error);
            });
        });
    }

    registerSubscription($subscription) {
        console.log('Registering Subscription to user: ', this.id);
        console.log('Sub: ', $subscription);

        //TODO: Maintain custom internal ID and Name, so we don't have to give out googleId
        //during API calls

        //TODO: Support for multiple account validations (google, facebook, twitter, etc..)
        let session = db.session();
        return session
            .run(
                'MATCH (user:User {googleId:{googleId}}) ' +
                'MERGE (user)-[rel:subscribed_by]->(sub:Subscription {endpoint:{endpoint},p256dh:{p256dh},auth:{auth}}) ' +
                'RETURN user, sub, rel',
                {
                    googleId: this.id,
                    endpoint: $subscription.endpoint,
                    p256dh: $subscription.keys.p256dh,
                    auth: $subscription.keys.auth
                }
            )
            .then((result) => {
                session.close();
                return new Promise((resolve, reject) => {
                    resolve(result);
                });
            })
            .catch((error) => {
                session.close();
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            });
    };

    //TODO: update new User() calls to use these instead
    static newUserFromGoogleIdObj($idObj){
        let user = new User();
        user.updateFromGoogleIdObj($idObj);
        return user;
    }

    static newUserFromDBRecord($userRecord){
        let user = new User();
        user.updateFromUserRecord($userRecord);
        return user;
    }

    updateFromGoogleIdObj($idObj) {
        console.log('FromGoogleData: ', $idObj);

        this.authType = 'google';
        this.data.google = {};
        this.data.google.id = $idObj.id;
        this.data.google.accessToken = $idObj.accessToken;
        this.data.google.refreshToken = $idObj.refreshToken;
        this.data.google.name = $idObj.name;
        this.data.google.email = $idObj.email;
    };

    updateFromUserRecord($userRecord) {
        this.authType = $userRecord.properties.authType;

        switch(this.authType) {
            case 'google':
                console.log('FromUserRecord: ', $userRecord.properties.googleId);
                this.data.google = {};
                this.data.google.id = $userRecord.properties.googleId;
                this.data.google.email = $userRecord.properties.googleEmail;
                this.data.google.name = $userRecord.properties.googleName;
                break;
            default:
                console.error('Bad Auth Type during updateFromUserRecord: ', this.authType);
        }
    }

    acceptInvite($inviteCode){
        //TODO: Proper response to user if invite is invalid
        console.log('Accepting invite: ', $inviteCode);
        let session = db.session();
        return session
            .run(
                'MATCH (invite:Invite {code:{inviteCode}})-[:invited_to]->(team) ' +
                'MATCH (invitee:User {googleId:{inviteeId}}) ' +
                'RETURN invitee,team',
                {
                    inviteCode:$inviteCode,
                    inviteeId:this.id
                }
            )
            .then(($dbResult) => {
                session.close();
                if($dbResult.records.length === 1) {
                    console.log('Accept invite returned records: ' + $dbResult.records.length);
                    return Team.addMember(
                        $dbResult.records[0].get('team').properties.teamName,
                        $dbResult.records[0].get('team').properties.teamId,
                        $dbResult.records[0].get('invitee').properties.googleId
                    );
                } else if($dbResult.records.length > 1){
                    //Too many, duplicate invites?  Should not happen
                    return new Promise((resolve, reject) => {
                        reject('More then 1 record was returned, should be only 1');
                    });
                } else {
                    //None returned, error
                    return new Promise((resolve, reject) => {
                        reject('No records returned');
                    });
                }
            })
            .catch(($error) => {
                session.close();
                console.error('Accept Invite Error: ', $error);
            });
    }

    get id() {
        return this.data[this.authType].id;
    }

    get name() {
        return this.data[this.authType].name;
    }

    get email() {
        return this.data[this.authType].email;
    }

    get refreshToken() {
        return this.data[this.authType].refreshToken;
    }

    get accessToken() {
        return this.data[this.authType].accessToken;
    }

    static findOrCreate($idObj) {
        if ($idObj.hasOwnProperty('google')) {
            console.log('Finding By Google ID: ', $idObj.google.id);
            let session = db.session();

            return session
                .run(
                    'MATCH (user:User {googleId:{googleId}}) RETURN user', {googleId: $idObj.google.id}
                )
                .then(($result) => {
                    session.close();
                    console.log('Matched User by ID: ', $idObj.google.id);
                    if ($result.records.length > 0) {
                        console.log('FindOrCreate: Creating New Memory User from DB: ' + $idObj.google.id);

                        return new Promise((resolve, reject) => {
                            let newUser = new User();
                            newUser.updateFromUserRecord($result.records[0].get('user'));
                            resolve(newUser);
                        });

                    } else {
                        console.log('No User Found');
                        console.log('Creating a new one...');

                        let newUser = new User();
                        newUser.updateFromGoogleIdObj($idObj.google);

                        let session = db.session();
                        return session.run(
                            'CREATE (user:User ' +
                            '{' +
                            'authType:{authType},' +
                            'googleId:{id}, ' +
                            'googleName:{name},' +
                            'googleEmail:{email}' +
                            '})',
                            {
                                authType: 'google',
                                id: newUser.id,
                                name: newUser.name,
                                email: newUser.email
                            }
                        )
                        .then(() => {
                            console.log('Looking for created user');
                            return session.run(
                                    'MATCH (user:User {googleId:{googleId}}) RETURN user',
                                    {googleId: newUser.id}
                                )
                        })
                        .then(($result) => {
                            return new Promise((resolve, reject) => {
                                resolve(newUser);
                            });
                        })
                        .catch(($error) => {
                            console.log('Catch here');
                            console.error($error);
                        });
                    }

                })
                .catch((error) => {
                    session.close();
                    return new Promise((resolve, reject) => {
                        console.error(error);
                        reject(error);
                    })
                })
        } else {
            //Bad login ID type
            console.error('Bad ID Type');
            throw new Error('Bad ID Type');
        }
    }

    static findById($userId) {
        console.log('Find By ID: ', $userId);
        let session = db.session();
        return session
            .run(
                'MATCH (user:User {googleId:{googleId}}) RETURN user', {googleId: $userId}
            )
            .then(result => {
                session.close();
                if (result.records.length > 0) {
                    console.log('FindByID: Creating Memory User from DB: ', $userId);
                    return new Promise((resolve, reject) => {
                        resolve(new User(result.records[0].get('user')));
                    });
                } else {
                    console.log('No User Found');
                    return new Promise((resolve, reject) => {
                        resolve(null);
                    });
                }
            })
            .catch((error) => {
                console.error('Bad user Lookup: ', error);
                session.close();
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            });
    }

    static findEndPointsByUserId($userId) {
        console.log('Find Endpoints by user id: ', $userId);
        let session = db.session();
        return session.run (
            'MATCH (user:User {googleId:{googleId}})-[:subscribed_by]->(subscription) ' +
            'RETURN user, subscription',
            {
                googleId: $userId
            }
        )
        .then((result) => {
            session.close();
            console.log('Results: ', result);
            return new Promise((resolve, reject) => {
                resolve(result);
            });
        })
        .catch((error) => {
            session.close();
            console.error('Bad find endpoints: ', error);
            return new Promise((resolve, reject) => {
                reject(error);
            })
        });
    }
}

module.exports = User;