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
import UIGEB from 'general/UIGEB';
import JacEvent from 'jac/events/JacEvent';

//import through loaders
import '../css/main.css';

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL | VerboseLevel.LINE);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

let geb = new GlobalEventBus();
let uigeb = new UIGEB();

l.debug('New Team Page');

//Setup managers
let uiManager = new UIManager(document);
let swManager = new ServiceWorkerManager();
let reqManager = new TeamPageRequestManager();

//Events
document.addEventListener('readystatechange', handleReadyStateChange ,false);

//Request Teams
reqManager.getTeams()
.then(($response) => {
    if($response.status === 'SUCCESS'){
        geb.dispatchEvent(new JacEvent('newteamlist', $response.data));
    } else if ($response.status === 'ERROR') {
        geb.dispatchEvent(new JacEvent('errorevent', $response.message));
    } else {
        l.error('Unknown response status: ', $response.status);
    }
});

reqManager.getBlockedMembers();

uigeb.addEventListener('requestunblockuser', ($evt) => {
    let evtId = $evt.id;
    l.debug('Event ID: ', evtId);
    reqManager.setBlockStatus($evt.data, false)
    .then(($response) => {
        l.debug('Completing request unblock user: ', $response);
        uigeb.completeUIEvent(evtId, $response);
    });
});

geb.addEventListener('requestmemberlist', ($evt) => {
    reqManager.getMembers($evt.data);
});

geb.addEventListener('requestMainPage', ($evt) => {
    l.debug('caught request main page');
    window.location = '/';
});

geb.addEventListener('requestchangemodstatus', ($evt) => {
    l.debug('caught request change mod status:', $evt.data);
    reqManager.setModStatus($evt.data.memberId, $evt.data.teamId, $evt.data.newIsModStatus);
});

uigeb.addEventListener('requestblockstatuschange', ($evt) => {
    l.debug('caught request change block status: ', $evt.data);
    let evtId = $evt.id;
    l.debug('Event ID: ', evtId);
    reqManager.setBlockStatus($evt.data.memberId, $evt.data.newIsBlockedStatus)
    .then(($response) => {
        l.debug('Completing request block status change: ', $response);
        uigeb.completeUIEvent(evtId, $response);
    });
});

geb.addEventListener('requestsendinvite', ($evt) => {
    l.debug('caught send invite request: ', $evt.data) ;
    reqManager.sendTeamInvite($evt.data.emailAddress, $evt.data.teamId);
});

geb.addEventListener('requestchangeteamnotifications', ($evt) => {
    l.debug('caught request change team notifications');
    reqManager.setTeamNotificationsStatus($evt.data.teamId, $evt.data.newTeamNotificationsStatus);
});

geb.addEventListener('newblockuserstatus', ($evt) => {
    l.debug('caught new block user status');
    reqManager.getBlockedMembers();
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
