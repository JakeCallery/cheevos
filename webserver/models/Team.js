/**
 * Created by Jake on 1/1/2017.
 */

const db = require('../config/db');

class Team {
    constructor() {
        //TODO: Maybe find a way to determine who called the constructor,
        //if not from the "Team" class then throw an error?
        this.name = null;
        this.id = null;
    }

    static createTeam($teamName, $teamId, $initialTeamMemeberId){
        console.log('Saving Team To DB...');
        console.log('Searching for existing team: ', $teamName, $teamId);
        return Team.findTeam($teamName, $teamId)
        .then(($records) => {
            if($records === null){
                //create a new team
                console.log('Creating new team...');
                let session = db.session();
                //TODO: Support for multiple account validations (google, facebook, twitter, etc..)
                return session
                    .run(
                        'MATCH (user:User {googleId:{googleId}}) ' +
                        'MERGE (user)-[rel:MEMBER_OF]->(team:TEAM {teamId:{teamId},teamName:{teamName}}) ' +
                        'RETURN user, team',
                        {
                            googleId: $initialTeamMemeberId,
                            teamId: $teamId,
                            teamName: $teamName
                        }
                    )
                    .then(($dbResult) => {
                        session.close();
                        console.log('Create Team Result: ' + $dbResult);
                        return new Promise((resolve, reject) => {
                             resolve($dbResult);
                        });
                    })
                    .catch(($error) => {
                        session.close();
                        return new Promise((resolve, reject) => {
                            console.log('Create Team Error: ', $error);
                            reject($error);
                        });
                    })

            } else {
                //team already exists
                return new Promise((resolve, reject) => {
                    console.log('Team Already Exists');
                    reject({'error':'ALREADY_EXISTS', 'message':'Team Already Exists'});
                });
            }
        })
        // .then(($dbResult) => {
        //     return new Promise((resolve, reject) => {
        //         resolve($dbResult);
        //     });
        // })
        .catch(($error) => {
            console.log('Error: ', $error);
        });

        //Check to see if Team already exists
        //If not, create a new one
        //If it does, see if name matches
        //If name does not match, save new name
        //Otherwise we are done
    }

    getMembers(){
        //TODO: Fill this in
    }

    static findTeam($name, $id) {
        let session = db.session();

        return session
            .run(
                'MATCH (team:Team {teamName:{teamName},teamId:{teamId}}) RETURN team',
                {
                    teamName: $name,
                    teamId: $id
                }
            )
            .then(($result) => {
                session.close();
                console.log('Num Found teams: ', $result.records.length);
                if($result.records.length > 1){
                    console.error('*** We may have a problem, more than 1 team returned from DB, should be 1 or 0');
                    return new Promise((resolve, reject) => {
                        reject('Returned more than 1 team with the same name and id, this should be 0 or 1!');
                    });
                } else if($result.records.length === 1){
                    return new Promise((resolve, reject) => {
                        resolve($result.records[0]);
                    });
                } else {
                    //Zero results, no team here
                    return new Promise((resolve, reject) => {
                        resolve(null);
                    });
                }
            })
            .catch(($error) => {
                session.close();
                console.log('Caught a DB Error: ', $error);
            });
    }
}

module.exports = Team;