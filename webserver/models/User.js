/**
 * Created by Jake on 12/28/2016.
 */
'use strict';

const db = require('../config/db');

class User {
    constructor ($data) {
        this.data = $data || {};
    }

    saveToDB($cb){
        console.log('Saving New User To DB');
        $cb();
    }

    static findById($id){
        console.log('Find By ID: ', $id);
        let session = db.session();
        return session
            .run(
                'MATCH (user:User {googleID:{userGoogleID}}) RETURN user', {userGoogleID: $id}
            )
            .then(result => {
                session.close();
                console.log('Result: ', result);
                console.log('Records: ', result.records.length);
                if(result.records.length > 0) {
                    console.log('Creating New User');
                    return new Promise((resolve, reject) => {
                        resolve(new User(result.records[0].get('user')));
                    })
                } else {
                    console.log('No User Found');
                    return new Promise ((resolve, reject) => {
                         resolve(null);
                    });
                }

            })
            .catch((error) => {
                session.close();
                throw error;
            })

    }
}

module.exports = User;