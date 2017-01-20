/**
 * Created by Jake on 1/20/2017.
 */

//Custom requires
const db = require('./config/db');
const opt = require('node-getopt');
const promiseRetry = require('promise-retry');
const shortId = require('shortid');

//Setup args
let args = opt.create([
['', 'init'                             , 'init totally blank db'],
['', 'apply-constraints'                , 'setup up constraints on db'],
['', 'test-userid-constraint[=userId]'  , 'test duplicate ID constraint'],
['', 'empty'                            , 'delete all nodes in db'],
['h', 'help'                            , 'display this help'],
['v', 'version'                         , 'show version']
])
.bindHelp()
.parseSystem();

console.log(args.options);
//return;

if(args.options['apply-constraints']){
    console.log('Applying Constraints');

    let session = db.session();
    session
        .run(
            'CREATE CONSTRAINT ON (user:User) ASSERT user.userId IS UNIQUE'
        )
        .then(($dbResponse) => {
            session.close();
            console.log('DB Response: ', $dbResponse);
        })
        .catch(($error) => {
            session.close();
            console.log('Error: ', $error);
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