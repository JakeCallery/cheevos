/**
 * Created by Jake on 12/28/2016.
 */
'use strict';

const db = require('../config/db');

class User {
    constructor($data) {
        this.data = $data || {};
    }

    fromGoogleIdObj($idObj) {
        this.authType = 'google';

        console.log('FromGoogleData: ', $idObj);
        this.data.google = {};
        this.data.google.id = $idObj.id;
        this.data.google.accessToken = $idObj.accessToken;
        this.data.google.refreshToken = $idObj.refreshToken;
        this.data.google.name = $idObj.name;
        this.data.google.email = $idObj.email;
    };

    fromUserRecord($userRecord) {
        console.log('FromUserRecord: ', $userRecord);
        this.data = $userRecord;
    }

    get id() {
        return this.data.google.id;
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
            console.log('Finding By Google ID: ', $idObj.google);
            let session = db.session();

            return session
                .run(
                    'MATCH (user:User {googleID:{googleID}}) RETURN user', {googleID: $idObj.google.id}
                )
                .then(($result) => {
                    session.close();
                    console.log('Result: ', $result);
                    console.log('Records: ', $result.records.length);
                    if ($result.records.length > 0) {
                        console.log('Creating New User');

                        return new Promise((resolve, reject) => {
                            let newUser = new User();
                            newUser.fromUserRecord($result.records[0].get('user'));
                            resolve(newUser);
                        });

                    } else {
                        console.log('No User Found');
                        console.log('Creating a new one...');

                        let newUser = new User();
                        newUser.fromGoogleIdObj($idObj.google);


                        let session = db.session();
                        return session.run(
                            'CREATE (user:User ' +
                            '{' +
                            'googleId:{id}, ' +
                            'googleName:{name},' +
                            'googleEmail:{email}' +
                            '})',
                            {
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
                            //TODO: remove me
                            console.log('----- Result: ', $result);
                            //////////////////////
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
                console.log('Result: ', result);
                console.log('Records: ', result.records.length);
                if (result.records.length > 0) {
                    console.log('Creating New User');
                    return new Promise((resolve, reject) => {
                        resolve(new User(result.records[0].get('user')));
                    })
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