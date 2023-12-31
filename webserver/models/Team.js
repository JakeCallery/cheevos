/**
 * Created by Jake on 1/1/2017.
 */

const db = require('../config/db');
const InviteManager = require('../managers/InviteManager');
const shortId = require('shortid');

class Team {
    constructor() {
        //TODO: Maybe find a way to determine who called the constructor,
        //if not from the "Team" class then throw an error?
        //this.name = null;
        //this.id = null;
    }

    static removeTeam($teamId){
        console.log('removeTeam Called: ', $teamId);

        let session = db.session();
        return session
        .run(
            'MATCH (team:Team {teamId:{teamId}}) ' +
            'DETACH DELETE team ' +
            'RETURN team',
            {
                teamId:$teamId
            }
        )
        .then(($dbResult) => {
            session.close();
            console.log('removeTeamResult: ', $dbResult);
            if($dbResult.records.length === 1){
                return new Promise((resolve, reject) => {
                    resolve($dbResult);
                });
            } else if($dbResult.records.length > 1){
                //something bad happened
                console.error('Should not be here, more than 1 team removed!');
                return new Promise((resolve, reject) => {
                    reject('More than 1 team removed!!');
                });
            } else {
                return new Promise((resolve, reject) => {
                    console.log('No Teams deleted...');
                    reject('Zero teams deleted');
                });
            }
        })
        .catch(($error) => {
            session.close();
            console.error('Remove Team Error: ', $error);
            return new Promise((resolve, reject) => {
                reject($error);
            });
        })
    }

    static isMemberOnlyModerator($memberId, $teamId){
        let session = db.session();
        return session
        .run(
            'MATCH (team:Team {teamId:{teamId}}) ' +
            '-[:moderated_by]->(user:User) ' +
            'return user',
            {
                teamId:$teamId
            }
        )
        .then(($dbResult) => {
            session.close();
            console.log('isMemberOnlyModerator Results: ', $dbResult);
            if($dbResult.records.length === 1 &&
                $dbResult.records[0].get('user').properties.userId === $memberId){
                return new Promise((resolve, reject) => {
                    resolve(true);
                });
            } else {
                return new Promise((resolve, reject) => {
                    resolve(false);
                });
            }
        })
        .catch(($error) => {
            session.close();
            console.log('isMemberOnlyModerator Error: ', $error);
            return new Promise((resolve, reject) => {
                reject($error);
            });
        });
    }

    static isMemberModerator($memberId, $teamId){
        let session = db.session();
        return session
        .run(
            'MATCH (user:User {userId:{userId}}) ' +
            'MATCH (team:Team {teamId:{teamId}}) ' +
            'MATCH (user)-[rel:moderates]->(team) ' +
            'RETURN rel',
            {
                userId: $memberId,
                teamId: $teamId
            }

        )
        .then(($dbResult) => {
           session.close();
           if($dbResult.records.length > 0) {
               return new Promise((resolve, reject) => {
                   console.log('Is a moderator');
                   resolve(true);
               });
           } else {
               return new Promise((resolve, reject) => {
                   console.log('Is NOT a moderator');
                   resolve(false);
               });
           }

        })
        .catch(($error) => {
            session.close();
            return new Promise((resolve, reject) => {
                reject($error);
            });
        });
    }

    static removeMember($memberId, $teamId){
        console.log('Removing member from team: ', $memberId);
        //TODO: Remove moderated_by and moderates relationships as well
        let session = db.session();
        return session
        .run(
            'MATCH (user:User {userId:{userId}}) ' +
            'MATCH (team:Team {teamId:{teamId}})' +
            'MATCH (user)-[rels]-(team) ' +
            'DELETE rels ' +
            'RETURN rels',
            {
                userId: $memberId,
                teamId: $teamId
            }
        )
        .then(($dbResult) => {
            session.close();
            console.log('removeMember returned: ', $dbResult);
            if($dbResult.records.length > 0){
                console.log('Results: ', $dbResult.records.length)

            } else {
                console.error('no records returned...');
            }

            return new Promise((resolve, reject) => {
                resolve($dbResult);
            });
        })
        .catch(($error) => {
            session.close();
            console.log('removeMember Error: ', $error);
            return new Promise((resolve, reject) => {
                reject($error);
            });
        });

    }

    static getMembers($teamId, $requesterId) {
        console.log('Getting Team Members');
        let session = db.session();
        let queryStr = '';

        if(typeof($requesterId) !== 'undefined'){
            //Don't include self and return moderates and blocking info
            queryStr =
                'MATCH (requester:User {userId:{requesterId}})' +
                'MATCH (team:Team {teamId:{teamId}}) ' +
                'MATCH (team)-[:has_member]->(member) ' +
                'WHERE NOT member.userId = {requesterId} ' +
                'OPTIONAL MATCH (member)-[mod:moderates]->(team) ' +
                'OPTIONAL MATCH (requester)-[block:is_blocking]->(member) ' +
                'RETURN member, SIGN(COUNT(mod)) AS isMod, SIGN(COUNT(block)) AS isBlocked';
        } else {
            //Include all members of team, return moderates info
            queryStr =
                'MATCH (team:Team {teamId:{teamId}}) ' +
                'MATCH (team)-[:has_member]->(member) ' +
                'OPTIONAL MATCH (member)-[mod:moderates]->(team) ' +
                'RETURN member, SIGN(COUNT(mod)) AS isMod';
        }

        return session
        .run(
            queryStr,
            {
                teamId: $teamId,
                requesterId: $requesterId
            }
        )
        .then(($dbResult) => {
            session.close();
            console.log('Get Members Returned: ' + $dbResult.records.length);
            if($dbResult.records.length > 0) {
                return new Promise((resolve, reject) => {
                    resolve($dbResult);
                });
            } else {
                return new Promise((resolve, reject) => {
                    reject('Get Member Error, no records returned');
                });
            }
        })
        .catch(($error) => {
            session.close();
            console.log('List Members Error: ', $error);
            return new Promise((resolve, reject) => {
                reject($error);
            });
        })
    }

    static removeModerator($memberId, $teamId) {
        console.log('Removing Team Moderator...', $memberId);
        let session = db.session();
        return session
        .run(
            'MATCH (user:User {userId:{userId}}) ' +
            'MATCH (team:Team {teamId:{teamId}}) ' +
            'MATCH (user)-[rel:moderates]->(team) ' +
            'MATCH (team)-[rel1:moderated_by]->(user)' +
            'DELETE rel, rel1 ' +
            'RETURN COUNT(rel), COUNT(rel1)',
            {
                userId:$memberId,
                teamId:$teamId
            }
        )
        .then(($dbResult) => {
            session.close();
            console.log('removeModerator Results: ', $dbResult.records.length);
            if($dbResult.records.length === 1) {
                //Good result
                console.log('Here1');
                return new Promise((resolve, reject) => {
                    resolve($dbResult);
                });
            } else if($dbResult > 1) {
                //something strange happened
                console.log('Here2');
                return new Promise((resolve, reject) => {
                    reject('Should not be here, more than 1 set of relationships removed');
                });
            } else {
                //not added
                console.log('Here3');
                return new Promise((resolve, reject) => {
                    reject('Zero Records removed');
                });
            }
        })
        .catch(($error) => {
            console.log('Error: ', $error);
            session.close();
            return new Promise((resolve, reject) => {
                reject($error);
            });
        });
    }

    static addModerator($memberId, $teamId) {
        console.log('Adding Team Moderator...', $memberId);
        let session = db.session();
        return session
        .run(
            'MATCH (user:User {userId:{userId}}) ' +
            'MATCH (team:Team {teamId:{teamId}}) ' +
            'MERGE (user)-[rel:moderates]->(team) ' +
            'MERGE (team)-[rel1:moderated_by]->(user)' +
            'RETURN rel, rel1',
            {
                userId:$memberId,
                teamId:$teamId
            }
        )
        .then(($dbResult) => {
            session.close();
            console.log('addModerator Results: ', $dbResult.records.length);
            if($dbResult.records.length === 1) {
                //Good result
                return new Promise((resolve, reject) => {
                    resolve($dbResult);
                });
            } else if($dbResult > 1) {
                //something strange happened
                return new Promise((resolve, reject) => {
                    reject('Should not be here, more than 1 set of relationships added');
                });
            } else {
                //not added
                return new Promise((resolve, reject) => {
                    reject('Zero Records added');
                });
            }
        })
        .catch(($error) => {
            session.close();
            return new Promise((resolve, reject) => {
                reject($error);
            });
        });

    }

    static isMember($memberId, $teamId){
        console.log('Checking if is member: ', $memberId, $teamId);
        let session = db.session();
        return session
        .run(
            'MATCH (user:User {userId:{userId}})-[rel:member_of]->' +
            '(team:Team {teamId:{teamId}}) ' +
            'RETURN rel',
            {
                userId:$memberId,
                teamId:$teamId
            }
        )
        .then(($dbResult) => {
            session.close();
            console.log('DB Result: ', $dbResult);
            if($dbResult.records.length > 0){
                return new Promise((resolve, reject) => {
                    resolve(true);
                });
            } else {
                return new Promise((resolve, reject) => {
                    resolve(false);
                });
            }
        })
        .catch(($error) => {
            session.close();
            return new Promise((resolve, reject) => {
                console.log('isMemberError: ', $error);
                reject($error);
            });
        });
    }

    static addMember($teamId, $memberId) {
        //TODO: Actually notify the user if they are already on the team.

        console.log('Adding Team Member...');
        let session = db.session();
        return session
            .run(
                'MATCH (team:Team {teamId:{teamId}}) ' +
                'MATCH (member:User {userId:{userId}}) ' +
                'MERGE (member)-[:member_of{notificationsEnabled:true}]->(team) ' +
                'MERGE (team)-[:has_member]->(member) ' +
                'RETURN member, team',
                {
                    teamId:$teamId,
                    userId:$memberId
                }
            )
            .then(($dbResult) => {
                session.close();
                console.log('Add Member Returned Records: ' + $dbResult.records.length);
                if($dbResult.records.length > 0) {
                    return new Promise((resolve, reject) => {
                        resolve($dbResult);
                    });
                } else {
                    return new Promise((resolve,reject) => {
                        reject('Add Member Error, no records returned');
                    }) ;
                }
            })
            .catch(($error) => {
                session.close();
                console.log('Add Member Error: ', $error);
                return new Promise((resolve, reject) => {
                    reject($error);
                });
            });
    }

    static createTeam($teamName, $initialTeamMemeberId){
        console.log('Saving Team To DB...');
        let newTeamId = shortId.generate();

        //create a new team
        console.log('Creating new team...');
        let session = db.session();
        //TODO: Support for multiple account validations (google, facebook, twitter, etc..)
        return session
            .run(
                'MATCH (user:User {userId:{userId}}) ' +
                'MERGE (user)-[rel:member_of{notificationsEnabled:true}]->(team:Team {teamName:{teamName},teamId:{teamId}}) ' +
                'MERGE (team)-[rel1:has_member]->(user) ' +
                'MERGE (team)-[rel2:moderated_by]->(user)' +
                'MERGE (user)-[rel3:moderates]->(team) ' +
                'RETURN user, team',
                {
                    userId: $initialTeamMemeberId,
                    teamId: newTeamId,
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
    }

    static inviteMember($invitorId, $email, $teamId) {
        console.log('InviteMember:');
        console.log($invitorId);
        console.log($email);
        console.log($teamId);
        return InviteManager.createInvite($invitorId, $email, $teamId);
    }

    static findTeam($teamId) {
        let session = db.session();

        return session
            .run(
                'MATCH (team:Team {teamId:{teamId}}) RETURN team',
                {
                    teamId: $teamId
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