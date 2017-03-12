/**
 * Created by Jake on 2/9/2017.
 */

import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import ServiceWorkerManager from 'general/ServiceWorkerManager';
import UIManager from 'teamPage/TeamUIManager';
import TeamPageRequestManager from 'teamPage/TeamPageRequestManager';

//import through loaders
import '../css/main.css';

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL | VerboseLevel.LINE);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

let geb = new GlobalEventBus();

l.debug('New Team Page');

//Setup managers
let uiManager = new UIManager(document);
let swManager = new ServiceWorkerManager();
let reqManager = new TeamPageRequestManager();

//Events
document.addEventListener('readystatechange', handleReadyStateChange ,false);

//Request Teams
reqManager.getTeams();

geb.addEventListener('requestMainPage', ($evt) => {
    l.debug('caught request main page');
    window.location = '/';
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
