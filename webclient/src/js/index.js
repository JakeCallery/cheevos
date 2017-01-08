/**
 * Created by Jake on 12/14/2016.
 */
import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';

//Import Service worker through loader
import swURL from "file-loader?name=service-worker.js!babel-loader!./service-worker";

//Import through loaders
import 'file-loader?name=manifest.json!./manifest.json';
import '../css/main.css';
import 'file-loader?name=icon.png!../images/icon.png';
import 'file-loader?name=badge.png!../images/badge.png';

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL | VerboseLevel.LINE);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

let isSubscribed = false;
let swRegistration = null;
let applicationServerPublicKey = 'BETix3nG7KB6YIvsG0kTrs3BGv5_ebD9X5Wg-4ebcOjd0E2Wp1SGJfdD--El1bxEaINOASoipqZF_qqFe0S51n8';

const pushButton = document.getElementById('pushButton');
const endpointTextArea = document.getElementById('endpointTextArea');
const sendButton = document.getElementById('sendButton');
const userIdField = document.getElementById('userIdField');
const teamNameField = document.getElementById('teamNameField');
const createTeamButton = document.getElementById('createTeamButton');
const listTeamsButton = document.getElementById('listTeamsButton');
const inviteEmailAddressField = document.getElementById('inviteEmailAddressField');
const inviteTeamNameField = document.getElementById('inviteTeamNameField');
const inviteTeamIdField = document.getElementById('inviteTeamIdField');
const inviteMemberButton = document.getElementById('inviteMemberButton');
const listMembersTeamNameField = document.getElementById('listMembersTeamNameField');
const listMembersTeamIdField = document.getElementById('listMembersTeamIdField');
const listMembersButton = document.getElementById('listMembersButton');
const removeMeButton = document.getElementById('removeMeButton');
const removeMeTeamNameField = document.getElementById('removeMeTeamNameField');
const removeMeTeamIdField = document.getElementById('removeMeTeamIdField');
const isModeratorTeamNameField = document.getElementById('isModeratorTeamNameField');
const isModeratorTeamIdField = document.getElementById('isModeratorTeamIdField');
const isModeratorButton = document.getElementById('isModeratorButton');
const isOnlyModeratorButton = document.getElementById('isOnlyModeratorButton');
const removeMemberMemberIdField = document.getElementById('removeMemberMemberIdField');
const removeMemberTeamNameField = document.getElementById('removeMemberTeamNameField');
const removeMemberTeamIdField = document.getElementById('removeMemberTeamIdField');
const removeMemberButton = document.getElementById('removeMemberButton');

userIdField.value = '101328274856075903430';
teamNameField.value = 'TestTeam1';
inviteEmailAddressField.value = 'jake.a.callery@gmail.com';
inviteTeamNameField.value = 'TestTeam1';
inviteTeamIdField.value = 'rJXKvXPSx';
listMembersTeamNameField.value = 'W00t';
listMembersTeamIdField.value = 'r1atrFdHx';


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
                teamName: removeMemberTeamNameField.value,
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
                teamName: isModeratorTeamNameField.value
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
                teamName: isModeratorTeamNameField.value
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
                teamName: listMembersTeamNameField.value
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
                 teamName: removeMeTeamNameField.value
             })
         })
         .then(($response) => {
             l.debug('Response: ', $response);
         })
         .catch(($error) => {
            l.error('Remove Me API Error: ', $error);
         });
    });

    sendButton.addEventListener('click', ($event) => {
        l.debug('Caught Send Click');
        fetch('/api/sendCheevo', {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                recipientId: userIdField.value,
                data:'test data!'
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
                teamName: inviteTeamNameField.value,
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
