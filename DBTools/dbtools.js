/**
 * Created by Jake on 1/20/2017.
 */

//Custom requires
const db = require('./config/db');
const opt = require('node-getopt');
const promiseRetry = require('promise-retry');
const shortId = require('shortid');

///////// FUNCTIONS ////////////
let createUser = function($name, $forcedId){
    $forcedId = $forcedId || shortId.generate();
    let session = db.session();
    return session
        .run
        (
            'CREATE (user:User {testName:{testName}, userId:{userId}}) RETURN user',
            {
                testName: $name,
                userId: $forcedId
            }
        )
        .then(($dbResults) => {
            session.close();
            console.log('Created: ' + $dbResults.records.length);
        })
        .catch(($error) => {
            session.close();
            console.error('Create user Error: ', $error);
            return new Promise((resolve, reject) => {
                reject($error);
            });
        });
};

let emptyDB = function(){
    console.log('Empty DB Called');
    prompt('Are you really really sure you want to remove all nodes in the DB[y/n]: ', ($response) => {
        if($response === 'y'){
            console.log('Bye Bye Nodes...');
            let session = db.session();
            session.run(
                'MATCH (n) DETACH DELETE n'
            )
                .then(($dbResult) => {
                    session.close();
                    console.log('EmptyDB result: ', $dbResult);
                    process.exit(0);
                })
                .catch(($error) => {
                    session.close();
                    console.error('EmptyDB Error: ', $error);
                    process.exit(1);
                })
        } else {
            console.log('Whew, that was a close one!');
            process.exit(0);
        }
    });

};

let prompt = function(question, callback) {
    let stdin = process.stdin,
        stdout = process.stdout;

    stdin.resume();
    stdout.write(question);

    stdin.once('data', function (data) {
        callback(data.toString().trim());
    });
};

////////////// Setup args /////////////
let args = opt.create([
['', 'init'                             , 'init totally blank db'],
['', 'apply-constraints'                , 'setup up constraints on db'],
['', 'test-userid-constraint[=userId]'  , 'test duplicate ID constraint'],
['', 'empty-db'                         , 'delete all nodes in db'],
['h', 'help'                            , 'display this help'],
['v', 'version'                         , 'show version']
])
.bindHelp()
.parseSystem();

console.log(args.options);

if(args.options['apply-constraints']){
    console.log('Applying Constraints');

    let session = db.session();
    console.log('Creating UNIQUE constraint for userId');
    session
        .run(
            'CREATE CONSTRAINT ON (user:User) ASSERT user.userId IS UNIQUE'
        )
        .then(() => {
            console.log('Creating UNIQUE constraint for teamId');
            return session.run('CREATE CONSTRAINT ON (team:Team) ASSERT team.teamId IS UNIQUE')
        })
        .then(() => {
            console.log('Creating UNIQUE constraint for badgeId');
            return session.run('CREATE CONSTRAINT ON (badge:Badge) ASSERT badge.badgeId IS UNIQUE');
        })
        .then(($dbResponse) => {
            session.close();
            console.log('DB Response: ', $dbResponse);
            process.exit(0);
        })
        .catch(($error) => {
            session.close();
            console.log('Error: ', $error);
            process.exit(1);
        });
}

if(typeof(args.options['test-userid-constraint']) !== 'undefined'){
    console.log('Testing duplicate user ids');
    let testId = args.options['test-userid-constraint'];

    if(testId === ''){
        testId = '000';
    }
    console.log('Using testId of: ', testId);

    promiseRetry((retry, number) => {
        console.log('Attempts: ', number);
        return createUser('TestName', testId)
        .catch(($error) => {
            console.error('Retry Error: ', $error);
            if($error.fields[0].code == 'Neo.ClientError.Schema.ConstraintValidationFailed'){
                console.log('Will retry');
                retry();
            }
        });
    }, {retries: 1})
    .then(($result) => {
        console.log('Complete');
        console.log($result);
    })
    .catch(($error) => {
        console.error('Retries Failed');
    });
}

if(typeof(args.options['empty-db']) !== 'undefined'){
    emptyDB();
}


