/**
 * Created by Jake on 1/1/2017.
 */

const db = require('../config/db');
const uuid = require('node-uuid');
const md5 = require('md5');

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
        })
        .catch(($error) => {
            console.error('Remove Invite Error: ', $error);
        });
    }

    static createInvite($invitorId, $email, $teamName, $teamId){
        let inviteCode = md5($invitorId + $teamId + uuid.v4());
        console.log('InviteCode: ' + inviteCode);

        let session = db.session();
        return session
            .run(
                'MATCH (user:User {googleId:{googleId}}) ' +
                'MATCH (team:Team {teamId:{teamId},teamName:{teamName}}) ' +
                'MERGE (user)-[rel:sent_invite]->(invite:Invite {code:{inviteCode},email:{email}}) ' +
                'MERGE (invite)-[rel1:invited_to]->(team) ' +
                'RETURN invite',{
                    googleId: $invitorId,
                    teamId: $teamId,
                    teamName: $teamName,
                    email: $email,
                    inviteCode: inviteCode
                }
            )
            .then(($dbResult) => {
                session.close();
                //TODO: Check for zero records returned
                return new Promise((resolve, reject) => {
                    resolve($dbResult);
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