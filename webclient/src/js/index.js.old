/**
 * Created by Jake on 12/14/2016.
 */
import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';
import 'file-loader?name=manifest.json!./manifest.json';

import swURL from "file-loader?name=service-worker.js!babel-loader!./service-worker";

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL | VerboseLevel.LINE);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);
l.debug('Index.js');

l.debug('Registering Service Worker...');

let key;
let authSecret;
let endpoint;

if ("serviceWorker" in navigator) {
    // Service worker registered
    navigator.serviceWorker.register(swURL)
        .then((registration) => {
            // Use the PushManager to get the user's subscription to the push service.
            // serviceWorker.ready will return the promise once the service worker is registered.
            // This can help to get rid of errors that occur while fetching subscription
            // information before registration of the service worker
            return navigator.serviceWorker.ready
                .then((serviceWorkerRegistration) =>{
                    return serviceWorkerRegistration.pushManager.getSubscription()
                        .then((subscription) => {
                            if(subscription) {
                                l.debug('Already Subscribed: ', subscription);
                                return subscription;
                            } else {
                                l.debug('Not yet subscribed, subscribing...');
                                return serviceWorkerRegistration.pushManager.subscribe({
                                    userVisibleOnly: true
                                })
                                    .then((subscription) => {
                                        l.debug('Good Subscription:');
                                        l.debug(subscription.subscriptionId);
                                        l.debug(subscription.endpoint);
                                        return subscription;
                                    }, (error) => {
                                        l.error('Subscription Error: ', error);
                                    });
                            }

                        });
                });
        })
        .then((subscription) => {
            //Get user's public key
            // Retrieve the user's public key.
            let rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
            l.debug('RawKey: ', rawKey);
            key = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : '';
            l.debug('Key: ', key);

            let rawAuthSecret = subscription.getKey ? subscription.getKey('auth') : '';
            l.debug('Raw Auth Secret: ', rawAuthSecret);
            authSecret = rawAuthSecret ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret))) : '';
            l.debug('Auth Secret: ', authSecret);

            //Save endpoint
            //endpoint = subscription.endpoint;
            endpoint = endpointWorkaround(subscription);
            l.debug('Endpoint: ', endpoint);

            // Send the subscription details to the server using the Fetch API.
            fetch('/register', {
                method: 'post',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    key: key,
                    authSecret: authSecret,
                }),
            });
        })
        .catch((err) => {
        // Service worker registration failed
            l.error('Service worker registration failed: ', err);
    });
} else {
    // Service worker is not supported
    //TODO: show error in UI
    l.error('Service Worker Not Supported');
}

document.getElementById('doIt').addEventListener('click', function() {

    fetch('/sendNotification', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            endpoint: endpoint,
            keys: {
                'p256dh': key,
                'auth': authSecret,
            },
            title: document.getElementById("notificationTitle").value,
            body: document.getElementById("notificationBody").value,
            icon: document.getElementById("notificationIcon").value,
            link: document.getElementById("notificationLink").value
        }),
    });
});

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