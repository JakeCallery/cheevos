/**
 * Created by Jake on 2/7/2017.
 */

//Imports
import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';
import JacEvent from 'jac/events/JacEvent';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import UIManager from 'appPage/AppUIManager';
import ServiceWorkerManager from 'general/ServiceWorkerManager';
import AppPageRequestManager from 'appPage/AppPageRequestManager';
import Status from 'general/Status';
import ErrorManager from 'general/ErrorManager';
import ReadyManager from 'ready/ReadyManager';

//Import through loaders
import 'file-loader?name=manifest.json!./manifest.json';
import '../css/normalize.css';
import '../css/main.css';
import 'file-loader?name=icon.png!../images/icon.png';
import 'file-loader?name=badge.png!../images/badge.png';

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL | VerboseLevel.LINE);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

//Wait for Ready
let readyManager = new ReadyManager();
readyManager.ready()
.then(($response) => {
    //Basic Managers / Buses
    let geb = new GlobalEventBus();
    let reqManager = new AppPageRequestManager();

    geb.addEventListener('serviceworkerregistered', ($evt) => {
        l.debug('SW Ready!');
    });

    geb.addEventListener('requestlogout', ($evt) => {
        l.debug('Caught Logout request');
        window.location = '/logout';
    });

    geb.addEventListener('requestmanageteams', ($evt) => {
        l.debug('caught request manage teams');
        window.location = '/teams';
    });

    geb.addEventListener('requestmyteams', ($evt) => {
        l.debug('caught request for teams');
        reqManager.getMyTeams()
            .then(($response) => {
                if($response.status === Status.SUCCESS){
                    geb.dispatchEvent(new JacEvent('newteams', $response.data));
                } else {
                    l.error('Unknown response status: ', $response.status);
                }
            })
            .catch(($error) => {
                geb.dispatchEvent(new JacEvent('errorevent', $error));
            });
    });

    geb.addEventListener('requestteammembers', ($evt) => {
        l.debug('caught request team members for team: ', $evt.data.teamName, $evt.data.teamId);
        reqManager.getTeamMembers($evt.data.teamId)
            .then(($response) => {
                if($response.status === Status.SUCCESS){
                    l.debug('here');
                    geb.dispatchEvent(new JacEvent('newmembers', $response.data));
                    l.debug('here1');
                } else {
                    l.error('Unknown response status: ', $response.status);
                }
            })
            .catch(($error) => {
                geb.dispatchEvent(new JacEvent('errorevent', $error));
            });
    });

    geb.addEventListener('requestsendbadge', ($evt) => {
        l.debug('Caught Request Send Badge: ', $evt.data);

        reqManager.sendBadge($evt.data)
            .then(($response) => {
                if($response.status === Status.SUCCESS){
                    geb.dispatchEvent(new JacEvent('sendbadgecomplete',$response));
                } else {
                    l.error('Unknown Response Status: ', $response.status);
                }
            })
            .catch(($error) => {
                geb.dispatchEvent(new JacEvent('errorevent', $error));
                geb.dispatchEvent(new JacEvent('sendbadgefailed', $error));
            });

    });

    //Setup Managers
    let errManager = new ErrorManager(document);
    let uiManager = new UIManager(document);
    let swManager = new ServiceWorkerManager();

    //Setup UI
    errManager.init();
    uiManager.init();

    //Get Initial Data
    reqManager.getMyTeams()
    .then(($response) => {
        if ($response.status === Status.SUCCESS) {
            geb.dispatchEvent(new JacEvent('newteams', $response.data));
        } else {
            l.error('Unknown Response Status: ', $response.status);
        }
    })
    .catch(($error) => {
        geb.dispatchEvent(new JacEvent('errorevent', $error));
    });

    reqManager.getRecentBadges()
    .then(($response) => {
        if ($response.status === Status.SUCCESS) {
            geb.dispatchEvent(new JacEvent('newrecentbadges', $response.data));
        } else {
            l.error('Unknown response status: ', $response.status);
        }
    })
    .catch(($error) => {
        geb.dispatchEvent(new JacEvent('errorevent', $error));
    });
})
.catch(($error) => {
    l.error('Ready ERROR: ', $error);
});
