/**
 * Created by Jake on 2/25/2017.
 */
import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';
import JacEvent from 'jac/events/JacEvent';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';


//Import Service worker through loader
import swURL from "file-loader?name=service-worker.js!babel-loader!../service-worker";

//TODO: Externalize this
let applicationServerPublicKey = 'BETix3nG7KB6YIvsG0kTrs3BGv5_ebD9X5Wg-4ebcOjd0E2Wp1SGJfdD--El1bxEaINOASoipqZF_qqFe0S51n8';

class ServiceWorkerManager extends EventDispatcher {
    constructor(){
        super();

        //Private
        let self = this;

        //Public
        this.geb = new GlobalEventBus();
        this.isSWRegistered = false;
        this.isSubscribed = null;
        this.swRegistration = null;

        //Delegates
        this.swRegisteredDelegate = EventUtils.bind(self, self.handleSWRegistered);
        this.requestToggleUserSubscriptionDelegate = EventUtils.bind(self, self.handleRequestToggleUserSubscription);

        //Events
        this.geb.addEventListener('serviceWorkerRegistered', self.swRegisteredDelegate);
        this.geb.addEventListener('requesttoggleusersubscription', self.requestToggleUserSubscriptionDelegate);
        this.geb.addEventListener('requestUnSubscribeUser', self.requestUnSubscribeUserDelegate);

        //Do work
        this.registerServiceWorker();
    }

    handleRequestToggleUserSubscription($evt){
        l.debug('Caught Request Toggle User Subscription');
        if(this.isSubscribed){
            this.unsubscribeUser();
        } else {
            this.subscribeUser();
        }
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            l.debug('Service Worker and Push is supported');
            navigator.serviceWorker.register(swURL)
            .then((swReg) => {
                l.debug('Service Worker is registered', swReg);
                this.swRegistration = swReg;
                this.geb.dispatchEvent(new JacEvent('serviceWorkerRegistered'));
            })
            .catch(($error) => {
                l.error('Service Worker Error', $error);
                this.geb.dispatchEvent(new JacEvent('serviceWorkerRegistrationError'));
            });
        } else {
            l.warn('Push messaging is not supported in this browser');
        }
    }

    handleSWRegistered(){
        l.debug('SWM Caught SW Registered...');
        l.debug('Checking for endpoint registration...');
        this.swRegistration.pushManager.getSubscription()
        .then((subscription) => {
            this.isSubscribed = !(subscription === null);
            this.updateSubscriptionOnServer(subscription);
            if (this.isSubscribed) {
                l.debug('User IS subscribed.');
                this.geb.dispatchEvent(new JacEvent('userSubscribed'));
            } else {
                l.debug('User is NOT subscribed.');
                this.geb.dispatchEvent(new JacEvent('userNotSubscribed'));
            }
        });
    }

    updateSubscriptionOnServer(subscription){
        if(subscription) {
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
            });
        } else {
            l.debug('NO SUBSCRIPTION:', subscription);
        }
    }

    subscribeUser() {
        const applicationServerKey = this.urlB64ToUint8Array(applicationServerPublicKey);
        this.swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        })
        .then((subscription) => {
            l.debug('User is subscribed: ', subscription);
            this.updateSubscriptionOnServer(subscription);
            this.isSubscribed = true;
            this.geb.dispatchEvent(new JacEvent('userSubscribed'));
        })
        .catch((error) => {
            l.debug('Failed to subscribe the user: ', error);
            this.geb.dispatchEvent(new JacEvent('userNotSubscribed'));
        });
    }

    unsubscribeUser(){
        this.swRegistration.pushManager.getSubscription()
        .then((subscription) => {
            if(subscription){
                return subscription.unsubscribe();
            }
        })
        .then(() => {
            this.updateSubscriptionOnServer(null);
            l.debug('User is unsubscribed');
            this.isSubscribed = false;
            this.geb.dispatchEvent(new JacEvent('userNotSubscribed'));
        })
        .catch((error) => {
            l.error('Error Unsubscribing: ', error);
        });
    }

    urlB64ToUint8Array(base64String) {
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
}

export default ServiceWorkerManager;