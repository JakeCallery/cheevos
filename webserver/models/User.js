/**
 * Created by Jake on 12/28/2016.
 */
'use strict';

const db = require('../config/db');

class User {
    constructor ($data) {
        this.data = $data;
    }

    static findById($id, $callback){
        console.log('Find By ID: ', $id);
        let session = db.session();
        session.close();

    }
}

module.exports = User;