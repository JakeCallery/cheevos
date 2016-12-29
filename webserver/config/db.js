/**
 * Created by Jake on 12/29/2016.
 */
'use strict';
const neo4j = require('neo4j-driver').v1;

//Set up connection driver
let driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'neo4j'));

//export
module.exports = driver;