/**
 * Created by Jake on 12/14/2016.
 */
import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';
import 'general/resources';

//Import Service worker through loader
import swURL from "file-loader?name=service-worker.js!babel-loader!./service-worker";

//Import through loaders
import 'file-loader?name=manifest.json!./manifest.json';
import '../css/normalize.css';
import '../css/main.css';


l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL | VerboseLevel.LINE);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

let isSubscribed = false;
let swRegistration = null;
let applicationServerPublicKey = 'BETix3nG7KB6YIvsG0kTrs3BGv5_ebD9X5Wg-4ebcOjd0E2Wp1SGJfdD--El1bxEaINOASoipqZF_qqFe0S51n8';

const pushButton = document.getElementById('pushButton');
const endpointTextArea = document.getElementById('endpointTextArea');
const badgeSendButton = document.getElementById('badgeSendButton');
const badgeUserIdField = document.getElementById('badgeUserIdField');
const badgeNameField = document.getElementById('badgeNameField');
const badgeDescField = document.getElementById('badgeDescField');
const badgeIconUrlField = document.getElementById('badgeIconUrlField');
const teamNameField = document.getElementById('teamNameField');
const createTeamButton = document.getElementById('createTeamButton');
const listTeamsButton = document.getElementById('listTeamsButton');
const inviteEmailAddressField = document.getElementById('inviteEmailAddressField');
const inviteTeamIdField = document.getElementById('inviteTeamIdField');
const inviteMemberButton = document.getElementById('inviteMemberButton');
const listMembersTeamIdField = document.getElementById('listMembersTeamIdField');
const listMembersButton = document.getElementById('listMembersButton');
const removeMeButton = document.getElementById('removeMeButton');
const removeMeTeamIdField = document.getElementById('removeMeTeamIdField');
const isModeratorTeamIdField = document.getElementById('isModeratorTeamIdField');
const isModeratorButton = document.getElementById('isModeratorButton');
const isOnlyModeratorButton = document.getElementById('isOnlyModeratorButton');
const removeMemberMemberIdField = document.getElementById('removeMemberMemberIdField');
const removeMemberTeamIdField = document.getElementById('removeMemberTeamIdField');
const removeMemberButton = document.getElementById('removeMemberButton');
const addModUserIdField = document.getElementById('addModUserIdField');
const addModTeamIdField = document.getElementById('addModTeamIdField');
const addModButton = document.getElementById('addModButton');
const removeModUserIdField = document.getElementById('removeModUserIdField');
const removeModTeamIdField = document.getElementById('removeModTeamIdField');
const removeModButton = document.getElementById('removeModButton');
const removeTeamTeamIdField = document.getElementById('removeTeamTeamIdField');
const removeTeamButton = document.getElementById('removeTeamButton');
const removeBadgeForUserBadgeIdField = document.getElementById('removeBadgeForUserBadgeIdField');
const removeBadgeForUserButton = document.getElementById('removeBadgeForUserButton');
const removeBadgeCompletelyBadgeIdField = document.getElementById('removeBadgeCompletelyBadgeIdField');
const removeBadgeCompletelyButton = document.getElementById('removeBadgeCompletelyButton');
const badgeTeamIdField = document.getElementById('badgeTeamIdField');
const getBadgesTeamId = document.getElementById('getBadgesTeamId');
const getBadgesButton = document.getElementById('getBadgesButton');
const blockUserButton = document.getElementById('blockUserButton');
const blockUserIdField = document.getElementById('blockUserIdField');
const unblockUserIdField = document.getElementById('unblockUserIdField');
const unblockUserButton = document.getElementById('unblockUserButton');
const listBlockedUsersButton = document.getElementById('listBlockedUsersButton');
const getAllSentBadgesButton = document.getElementById('getAllSentBadgesButton');
const listSentBadgesUserIdField = document.getElementById('listSentBadgesUserIdField');
const listSentBadgesUserButton = document.getElementById('listSentBadgesUserButton');
const listSentBadgesUserIdOnTeamIdField = document.getElementById('listSentBadgesUserIdOnTeamIdField');
const listSentBadgesUserOnTeamIdField = document.getElementById('listSentBadgesUserOnTeamIdField');
const listSentBadgesUserOnTeamButton = document.getElementById('listSentBadgesUserOnTeamButton');
const teamNotificationsTeamIdField = document.getElementById('teamNotificationsTeamIdField');
const enableTeamNotificationsButton = document.getElementById('enableTeamNotificationsButton');
const disableTeamNotificationsButton = document.getElementById('disableTeamNotificationsButton');
const getTeamNotificationsEnabledButton = document.getElementById('getTeamNotificationsEnabledButton');

badgeIconUrlField.value = '/testBadgeIcon.png';
badgeNameField.value = 'Test Badge ' + new Date();
badgeDescField.value = 'Sweet Test Badge description! W00t! ' + new Date();
badgeTeamIdField.value = 'r1atrFdHx';

inviteEmailAddressField.value = 'jake.a.callery@gmail.com';


function updateBtn() {
    if (Notification.permission === 'denied') {
        pushButton.textContent = 'Push Messaging Blocked.';
        pushButton.disabled = true;
        updateSubscriptionOnServer(null);
        return;
    }

    if (isSubscribed) {
        pushButton.textContent = 'Disable Push Messaging';
    } else {
        pushButton.textContent = 'Enable Push Messaging';
    }

    pushButton.disabled = false;
}

function initialiseUI() {
    enableTeamNotificationsButton.addEventListener('click', ($event) => {
        l.debug('Caught Enable Team Note click');
        fetch('/api/enableTeamNotifications', {
            method:'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body:JSON.stringify({
                teamId: teamNotificationsTeamIdField.value
            })
        })
        .then(($response) => {
            l.debug('Response: ', $response);
        })
        .catch(($error) => {
            l.error('Error: ', $error);
        });
    });

    disableTeamNotificationsButton.addEventListener('click', ($event) => {
        l.debug('Caught Disable Team Note click');
        fetch('/api/disableTeamNotifications', {
            method:'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body:JSON.stringify({
                teamId: teamNotificationsTeamIdField.value
            })
        })
            .then(($response) => {
                l.debug('Response: ', $response);
            })
            .catch(($error) => {
                l.error('Error: ', $error);
            });
    });

    getTeamNotificationsEnabledButton.addEventListener('click', ($event) => {
        l.debug('Caught Check Team Note enabled status click');
        fetch('/api/getTeamNotificationsEnabled', {
            method:'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body:JSON.stringify({
                teamId: teamNotificationsTeamIdField.value
            })
        })
            .then(($response) => {
                l.debug('Response: ', $response);
            })
            .catch(($error) => {
                l.error('Error: ', $error);
            });
    });

    listSentBadgesUserOnTeamButton.addEventListener('click', ($event) => {
        l.debug('Caught List badges to user on team click');
        fetch('/api/listBadgesSentToUserOnTeam', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body:JSON.stringify({
                recipientId: listSentBadgesUserIdOnTeamIdField.value,
                teamId: listSentBadgesUserOnTeamIdField.value
            })
        })
        .then(($response) => {
            l.debug('List Badges to User on team Response: ', $response);
        })
        .catch(($error) => {
            l.error('List badges to user on team Error: ', $error);
        });
    });

    listSentBadgesUserButton.addEventListener('click', ($event) => {
        l.debug('Caught List Badges to user click');
        fetch('/api/listBadgesSentToUser', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                recipientId: listSentBadgesUserIdField.value
            })
        })
        .then(($response) => {
            l.debug('List Sent Badges To User Response: ', $response);
        })
        .catch(($error) => {
            l.error('List badges sent to user error: ', $error);
        });
    });

    getAllSentBadgesButton.addEventListener('click', ($event) => {
        l.debug('Caught get all sent badges click');
        fetch('/api/listAllSentBadges', {
            method: 'GET',
            credentials: 'include'
        })
        .then(($response) => {
            l.debug('List All Badges Response: ', $response);
        })
        .catch(($error) => {
            l.error('List All Badges Error: ', $error);
        });
    });

    listBlockedUsersButton.addEventListener('click', ($event) =>{
        l.debug('Caught list blocked users click');
        fetch('/api/listBlockedUsers', {
            method: 'GET',
            credentials: 'include'
        })
        .then(($response) => {
            l.debug('Response: ', $response);
        })
        .catch(($error) => {
            l.error('List Blocked Users Error: ', $error);
        });
    });

    unblockUserButton.addEventListener('click', ($event) => {
        l.debug('Caught Unblock user click');
        fetch('/api/unblockUser', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body:JSON.stringify({
                userIdToUnblock:unblockUserIdField.value
            })
        })
        .then(($response) => {
            l.debug('response: ', $response);
        })
        .catch(($error) => {
            l.error('unblock error: ', $error);
        });
    });
    blockUserButton.addEventListener('click', ($event) => {
        l.debug('Caught Block User Click');
        fetch('/api/blockUser', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                memberId:blockUserIdField.value
            })
        })
        .then(($response) => {
            l.debug('Block User Response: ' + $response);
        })
        .catch(($error) => {
            l.error('Block User Error: ', $error);
        })
    });

    getBadgesButton.addEventListener('click', ($event) => {
        l.debug('Caught Get Badges Click');
        fetch('/api/listMyBadges', {
            method:'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                teamId: getBadgesTeamId.value
            })
        })
        .then(($response) => {
            l.debug('Get Badges Response: ', $response);
        })
        .catch(($error) => {
            l.error('Get Badges Error: ', $error);
        })
    });

    removeBadgeCompletelyButton.addEventListener('click', ($event) => {
        l.debug('Caught Remove badge completely click...');
        fetch('/api/removeBadgeCompletely', {
            method: 'DELETE',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                badgeId: removeBadgeCompletelyBadgeIdField.value
            })
        })
            .then(($response) => {
                l.debug('Remove Badge Response: ', $response)
            })
            .catch(($error) => {
                l.error('Remove Badge Error: ', $error);
            });
    });

    removeBadgeForUserButton.addEventListener('click', ($event) => {
        l.debug('Caught Remove badge for user click...');
        fetch('/api/removeBadgeFromMe', {
            method: 'DELETE',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                badgeId: removeBadgeForUserBadgeIdField.value
            })
        })
        .then(($response) => {
            l.debug('Remove Badge Response: ', $response)
        })
        .catch(($error) => {
            l.error('Remove Badge Error: ', $error);
        });
    });

    removeTeamButton.addEventListener('click', ($event) => {
        l.debug('Caught remove team click');
        fetch('/api/removeTeam', {
            method: 'DELETE',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                teamId:removeTeamTeamIdField.value
            })
        })
        .then(($response) => {
            l.debug('Response: ', $response);
        })
        .catch(($error) => {
            l.error('Remove Team Error: ', $error);
        });
    });

    addModButton.addEventListener('click', ($event) => {
        l.debug('Caught Add Mod Click');
        fetch('/api/addModerator', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                memberId: addModUserIdField.value,
                teamId: addModTeamIdField.value
            })
        })
        .then(($response) => {
            l.debug('Add Mod Response: ', $response);
        })
        .catch(($error) => {
            l.error('Add Mod Error: ', $error);
        });
    });

    removeModButton.addEventListener('click', ($event) => {
        l.debug('Caught Remove Mod Click');
        fetch('/api/removeModerator', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                memberId: removeModUserIdField.value,
                teamId: removeModTeamIdField.value
            })
        })
            .then(($response) => {
                l.debug('Remove Mod Response: ', $response);
            })
            .catch(($error) => {
                l.error('Remove Mod Error: ', $error);
            });
    });

    removeMemberButton.addEventListener('click', ($event) => {
        l.debug('Caught removeMember click');
        fetch('/api/removeMemberFromTeam', {
            method: 'DELETE',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                memberId: removeMemberMemberIdField.value,
                teamId: removeMemberTeamIdField.value
            })
        })
        .then(($response) => {
            l.debug('Response: ', $response);
        })
        .catch(($error) => {
            l.error('Remove Member Error: ', $error);
        })
    });

    isOnlyModeratorButton.addEventListener('click', ($event) => {
        l.debug('Caught Is Only Moderator Click');
        fetch('/api/isOnlyModerator', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                teamId: isModeratorTeamIdField.value,
            })
        })
        .then(($response) => {
            $response.json()
                .then(($res) => {
                    l.debug('IsOnlyModerator: ', $res.isOnlyModerator);
                })
                .catch(($error) => {
                    l.error('isOnlyModerator bad json response: ', $err);
                })
        })
        .catch(($error) => {
            l.error($error);
        });
    });

    isModeratorButton.addEventListener('click', ($event) => {
        l.debug('Caught Is Moderator Click');
        fetch('/api/isModerator', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                teamId: isModeratorTeamIdField.value,
            })
        })
        .then(($response) => {
            $response.json()
            .then(($res) => {
                l.debug('IsModerator: ', $res.isModerator);
            })
            .catch(($error) => {
                l.error('isModerator bad json response: ', $err);
            })
        })
        .catch(($error) => {
            l.error($error);
        });
    });

    listMembersButton.addEventListener('click', ($event) => {
        l.debug('Caught List Members Click');
        fetch('/api/listMembers', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                teamId: listMembersTeamIdField.value,
            })
        })
        .then(($response) => {
            l.debug('List Members API Response: ', $response);
        })
        .catch(($error) => {
            l.error('List Members API Error: ', $error);
        })
    });

    removeMeButton.addEventListener('click', ($event) => {
         l.debug('Caught Remove Me Click');
         fetch('/api/removeMeFromTeam', {
             method: 'DELETE',
             credentials: 'include',
             headers: new Headers({
                 'Content-Type': 'application/json'
             }),
             body: JSON.stringify({
                 teamId: removeMeTeamIdField.value,
             })
         })
         .then(($response) => {
             l.debug('Response: ', $response);
         })
         .catch(($error) => {
            l.error('Remove Me API Error: ', $error);
         });
    });

    badgeSendButton.addEventListener('click', ($event) => {
        l.debug('Caught Send Click');
        fetch('/api/sendBadge', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                memberId: badgeUserIdField.value,
                iconUrl: badgeIconUrlField.value,
                nameText: badgeNameField.value,
                descText: badgeDescField.value,
                teamId: badgeTeamIdField.value,
            })
        })
        .then((response) => {
             l.debug('Response: ', response);
        })
        .catch((error) => {
            l.debug('Send Cheevo Error: ', error);
        });
    });

    createTeamButton.addEventListener('click', ($event) => {
        l.debug('Caught Create Team Click: ' + teamNameField.value);
        fetch('/api/createTeam', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                teamName: teamNameField.value
            })
        })
        .then(($response) => {
            l.debug('Response: ', $response);
        })
        .catch(($error) => {
            l.error('Create Team Error: ', $error);
        });
    });

    listTeamsButton.addEventListener('click', ($event) => {
        l.debug('Caught List Teams Click');
        fetch('/api/listMyTeams', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({

            })
        })
        .then(($response) => {
            l.debug('Response: ', $response);
        })
        .catch(($error) => {
            l.debug('List Teams Error: ', $error);
        });
    });

    inviteMemberButton.addEventListener('click', ($event) => {
        l.debug('Caught Invite Click');
        fetch('/api/inviteMember', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                email: inviteEmailAddressField.value,
                teamId: inviteTeamIdField.value
            })
        })
        .then(($response) => {
            l.debug('Invite Response: ', $response);
        })
        .catch(($error) => {
            l.error('Invite Error: ', $error);
        })
    });

    pushButton.addEventListener('click', () => {
        pushButton.disabled = true;
        if(isSubscribed) {
            let result = unsubscribeUser();
            l.debug('Result: ', result);
        } else {
            subscribeUser();
        }
    });

    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            isSubscribed = !(subscription === null);
            updateSubscriptionOnServer(subscription);
            if (isSubscribed) {
                console.log('User IS subscribed.');
            } else {
                console.log('User is NOT subscribed.');
            }

            updateBtn();
        });

}

if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');

    navigator.serviceWorker.register(swURL)
        .then(function(swReg) {
            console.log('Service Worker is registered', swReg);

            swRegistration = swReg;
            initialiseUI();
        })
        .catch(function(error) {
            console.error('Service Worker Error', error);
        });
} else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
    .then((subscription) => {
        l.debug('User is subscribed: ', subscription);
        updateSubscriptionOnServer(subscription);
        isSubscribed = true;
        updateBtn();
    })
    .catch((error) => {
        l.debug('Failed to subscribe the user: ', error);
        updateBtn();
    });
}

function unsubscribeUser(){
    swRegistration.pushManager.getSubscription()
    .then((subscription) => {
        if(subscription){
            return subscription.unsubscribe();
        }
    })
    .catch((error) => {
        l.error('Error Unsubscribing: ', error);
    })
    .then(() => {
        updateSubscriptionOnServer(null);
        l.debug('User is unsubscribed');
        isSubscribed = false;
        updateBtn();
    });
}

function updateSubscriptionOnServer(subscription){
    if(subscription) {
        endpointTextArea.value = JSON.stringify(subscription);
        l.debug(JSON.stringify(subscription));
        fetch('/api/registerSubscription', {
            method: 'post',
            body: JSON.stringify(subscription),
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })
        .then(($response) => {
            l.debug('Success: ', $response);
        })
        .catch(($response) => {
            l.error('Error: ', $response);
        })

    } else {
        l.debug('NO SUBSCRIPTION:', subscription);
    }
}


function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
