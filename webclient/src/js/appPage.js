/**
 * Created by Jake on 2/7/2017.
 */

import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';
import JacEvent from 'jac/events/JacEvent';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import UIManager from 'appPage/UIManager';
import ServiceWorkerManager from 'general/ServiceWorkerManager';

//Import through loaders
import 'file-loader?name=manifest.json!./manifest.json';
import '../css/main.css';
import 'file-loader?name=icon.png!../images/icon.png';
import 'file-loader?name=badge.png!../images/badge.png';

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL | VerboseLevel.LINE);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

let geb = new GlobalEventBus();
let isSubscribed = false;
let swRegistration = null;

//TODO: Find a way to put this in as external (file loader)
let applicationServerPublicKey = 'BETix3nG7KB6YIvsG0kTrs3BGv5_ebD9X5Wg-4ebcOjd0E2Wp1SGJfdD--El1bxEaINOASoipqZF_qqFe0S51n8';

//Setup Managers
let uiManager = new UIManager(document);
let swManager = new ServiceWorkerManager();

//DOM Elements
let profileImg = document.getElementById('profileImg');

//Events
document.addEventListener('readystatechange', handleReadyStateChange ,false);
geb.addEventListener('serviceWorkerRegistered', ($evt) => {
    l.debug('SW Ready!');
});

geb.addEventListener('requestLogOut', ($evt) => {
    l.debug('Caught Logout request');
    window.location = '/logout';
});

geb.addEventListener('requestManageTeams', ($evt) => {
    l.debug('caught request manage teams');
    window.location = '/teams';
});

function handleReadyStateChange($evt) {
    l.debug('Ready State Change: ', $evt.target.readyState);
    if($evt.target.readyState === 'interactive'){
        uiManager.init();
    } else if($evt.target.readyState === 'complete'){
        l.debug('Document Complete');
        document.removeEventListener('readystatechange', handleReadyStateChange,false);
    }
}
