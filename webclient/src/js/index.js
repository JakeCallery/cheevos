/**
 * Created by Jake on 12/14/2016.
 */
import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';
import 'file-loader?name=manifest.json!./manifest.json';
import '../css/index.css';

import swURL from "file-loader?name=service-worker.js!babel-loader!./service-worker";

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL | VerboseLevel.LINE);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

let isSubscribed = false;
let swRegistration = null;

const applicationServerPublicKey = 'BOM6hsZ1GidqcXtECJUyQaEkXCiPixzNWbIOCr5pSx4FNOzkkYD-2wbOVbAMuYPYH2jXKss3WFP6JKxvKe46iRI';
const pushButton = document.querySelector('.js-push-btn');

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
    pushButton.addEventListener('click', () => {
        pushButton.disabled = true;
        if(isSubscribed) {
            //TODO: unsubscribe user
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

function updateSubscriptionOnServer(subscription){
    if(subscription) {
        l.debug(JSON.stringify(subscription));
    } else {
        l.debug('NO SUBSCRIPTION:', subscription);
    }
}

// document.getElementById('doIt').addEventListener('click', function() {
//
//     fetch('/sendNotification', {
//         method: 'post',
//         headers: {
//             'Content-type': 'application/json'
//         },
//         body: JSON.stringify({
//             endpoint: endpoint,
//             keys: {
//                 'p256dh': key,
//                 'auth': authSecret,
//             },
//             title: document.getElementById("notificationTitle").value,
//             body: document.getElementById("notificationBody").value,
//             icon: document.getElementById("notificationIcon").value,
//             link: document.getElementById("notificationLink").value
//         }),
//     });
// });

// This method handles the removal of subscriptionId
// in Chrome 44 by concatenating the subscription Id
// to the subscription endpoint
function endpointWorkaround(pushSubscription) {

    if(pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') === 0){
        let list = pushSubscription.endpoint.split('https://android.googleapis.com/gcm/send');
        list[0] = 'https://fcm.googleapis.com/fcm/send';
        //list[0] = 'https://gcm-http.googleapis.com/gcm';
        let alteredEndpoint = list.join('');
        l.debug('Altered Endpoint: ', alteredEndpoint);
        return alteredEndpoint;
    }

    // Make sure we only mess with GCM
    if (pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') !== 0) {
        return pushSubscription.endpoint;
    }

    let mergedEndpoint = pushSubscription.endpoint;
    // Chrome 42 + 43 will not have the subscriptionId attached
    // to the endpoint.
    if (pushSubscription.subscriptionId &&
        pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
        // Handle version 42 where you have separate subId and Endpoint
        mergedEndpoint = pushSubscription.endpoint + '/' +
            pushSubscription.subscriptionId;

    }
    return mergedEndpoint;
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

// function testPush(){
//     l.debug('Test Push...');
//
//     fetch('/sendNotification', {
//         method: 'post',
//         headers: {
//             'Content-type': 'application/json'
//         },
//         body: JSON.stringify({
//             endpoint: endpoint,
//             key: key,
//             authSecret: authSecret,
//             title: document.getElementById("notificationTitle").value,
//             body: document.getElementById("notificationBody").value,
//             icon: document.getElementById("notificationIcon").value,
//             link: document.getElementById("notificationLink").value
//         }),
//     }).then((data) => {
//             l.debug('Fetch Complete', data);
//         }, (error) => {
//             l.error('Fetch Failed', error);
//     });
// }