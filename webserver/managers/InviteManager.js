/**
 * Created by Jake on 1/1/2017.
 */

const uuid = require('node-uuid');
const md5 = require('md5');

const db = require('../config/db');
const EmailManager = require('../managers/EmailManager');

class InviteManager {
    constructor(){
        //Nothing to construct
    }

    static removeInvite($inviteCode){
        let session = db.session();
        return session
        .run(
            'MATCH (invite:Invite {code:{inviteCode}})' +
            'DETACH DELETE invite',
            {
                inviteCode: $inviteCode
            }
        )
        .then(($dbResult) => {
            session.close();
            return new Promise((resolve, reject) => {
                resolve();
            });
        })
        .catch(($error) => {
            console.error('Remove Invite Error: ', $error);
            return new Promise((resolve, reject) => {
                reject($error);
            });
        });
    }

    //TODO: Add Invitor Name to email
    static createInvite($invitorId, $email, $teamId){
        let inviteCode = md5($invitorId + $teamId + uuid.v4());
        console.log('InviteCode: ' + inviteCode);

        let session = db.session();
        return session
        .run(
            'MATCH (user:User {userId:{userId}}) ' +
            'MATCH (team:Team {teamId:{teamId}}) ' +
            'MERGE (user)-[rel:sent_invite]->(invite:Invite {code:{inviteCode},email:{email}}) ' +
            'MERGE (invite)-[rel1:invited_to]->(team) ' +
            'RETURN invite, team, user',{
                userId: $invitorId,
                teamId: $teamId,
                email: $email,
                inviteCode: inviteCode
            }
        )
        .then(($dbResult) => {
            session.close();
            return new Promise((resolve, reject) => {
                if($dbResult.records.length === 1){
                    resolve($dbResult);
                } else {
                    reject('Expected 1 invite record, got: ' + $dbResult.records.length);
                }
            });
        })
        .catch(($error) => {
            session.close();
            return new Promise((resolve, reject) => {
                console.log('Invite Error: ', $error);
                reject($error);
            });
        });
    }
}

module.exports = InviteManager;