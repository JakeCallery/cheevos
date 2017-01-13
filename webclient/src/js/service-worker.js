/**
 * Created by Jake on 12/15/2016.
 */
'use strict';

self.addEventListener('install', function(event) {
    console.log('A new service worker is installing...');
    //event.waitUntil(self.skipWaiting()); //will install the serviceworker
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker Final Active');
    //event.waitUntil(self.clients.claim()); //will activate the serviceworker
});

// Register event listener for the 'push' event.
self.addEventListener('push', function($event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${$event.data.text()}"`);
    console.log('Event: ', $event);
    let payload = $event.data.json();
    console.log('Payload: ', payload);

    const title = payload.nameText;
    const options = {
        body: payload.descText,
        icon: payload.iconUrl,
        badge: 'badge.png'
    };

    $event.waitUntil(
        self.registration.showNotification(title, options)
    );
    // // Retrieve the textual payload from event.data (a PushMessageData object).
    // let payload = JSON.parse(event.data.text());
    // let clickUrl = payload.url;
    //
    // // Keep the service worker alive until the web push notification is created.
    // event.waitUntil(
    //     // Show a notification
    //     self.registration.showNotification(payload.title, {
    //         body: payload.body,
    //         icon: payload.icon
    //     })
    // );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification Click Received.');
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://developers.google.com/web')
    );
});

// Register event listener for the 'notificationclick' event.
// self.addEventListener('notificationclick', function(event) {
//     event.waitUntil(
//         // Retrieve a list of the clients of this service worker.
//         self.clients.matchAll().then(function(clientList) {
//             // If there is at least one client, focus it.
//             if (clientList.length > 0) {
//                 return clientList[0].focus();
//
//             }
//
//             // Otherwise, open a new page.
//             return self.clients.openWindow(clickUrl);
//         })
//     );
//});


