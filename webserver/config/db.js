/**
 * Created by Jake on 12/29/2016.
 */
'use strict';
const neo4j = require('neo4j-driver').v1;
const authConfig = require('../keys/authConfig');

//Set up connection driver
console.log('***** Setting up DB connection *****');
let driver = neo4j.driver('bolt://localhost', neo4j.auth.basic(authConfig.neo4jAuth.username, authConfig.neo4jAuth.password), {
    trust: "TRUST_ON_FIRST_USE",
    encrypted:"ENCRYPTION_NON_LOCAL"
});

driver.onCompleted = function(){
    console.log('DB Driver Connected');
};

driver.onError = function($err){
    console.log('DB Driver Error: ', $err);
};

//export
module.exports = driver;