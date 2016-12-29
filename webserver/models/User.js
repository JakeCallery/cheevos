/**
 * Created by Jake on 12/28/2016.
 */
'use strict';

const db = require('../config/db');

class User {
    constructor($data) {
        this.data = $data || {};
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

    static findById($id) {
        console.log('Find By ID: ', $id);
        let session = db.session();
        return session
            .run(
                'MATCH (user:User {googleId:{googleId}}) RETURN user', {googleId: $id}
            )
            .then(result => {
                session.close();
                if (result.records.length > 0) {
                    console.log('FindByID: Creating Memory User from DB: ', $id);
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
            });
    }
}

module.exports = User;