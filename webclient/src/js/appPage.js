/**
 * Created by Jake on 2/7/2017.
 */

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

//Import through loaders
import 'file-loader?name=manifest.json!./manifest.json';
import '../css/main.css';
import 'file-loader?name=icon.png!../images/icon.png';
import 'file-loader?name=badge.png!../images/badge.png';

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL | VerboseLevel.LINE);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

let geb = new GlobalEventBus();

//TODO: Find a way to put this in as external (file loader)
let applicationServerPublicKey = 'BETix3nG7KB6YIvsG0kTrs3BGv5_ebD9X5Wg-4ebcOjd0E2Wp1SGJfdD--El1bxEaINOASoipqZF_qqFe0S51n8';

//Setup Managers
let uiManager = new UIManager(document);
let swManager = new ServiceWorkerManager();
let reqManager = new AppPageRequestManager();

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

geb.addEventListener('requestMyTeams', ($evt) => {
    l.debug('caught request for teams');
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
        l.debug('List Teams Responded...');
        $response.json()
        .then(($res) => {
            l.debug('RES: ', $res);
            let data = $res.data;
            geb.dispatchEvent(new JacEvent('requestMyTeamsResponse', $res.data));
        })
        .catch(($error) => {
            l.error('List Teams parse error: ', $error);
        });
    })
    .catch(($error) => {
        l.debug('List Teams Error: ', $error);
    });
});

geb.addEventListener('requestTeamMembers', ($evt) => {
    l.debug('caught request team members for team: ', $evt.data.teamName, $evt.data.teamId);
    fetch('/api/listMembers', {
        method: 'POST',
        credentials: 'include',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            teamId: $evt.data.teamId
        })
    })
    .then(($response) => {
        l.debug('List Members API Response: ', $response);
        $response.json()
        .then(($res) => {
            let data = $res.data;
            geb.dispatchEvent(new JacEvent('requestTeamMembersResponse', data));

        })
        .catch(($error) => {
            l.error('List Members Parsing Error: ', $error);
        })
    })
    .catch(($error) => {
        l.error('List Members API Error: ', $error);
    })
});

geb.addEventListener('requestSendBadge', ($evt) => {
    l.debug('Caught Request Send Badge: ', $evt.data);

    fetch('/api/sendBadge', {
        method: 'POST',
        credentials: 'include',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify($evt.data)
    })
    .then(($response) => {
        $response.json()
        .then(($res) => {
            l.debug('Response: ', $res);
            geb.dispatchEvent(new JacEvent('sendBadgeComplete',$res));
        })
        .catch(($error) => {
            l.error('Send Badge Response Parse Error: ', $error);
            geb.dispatchEvent(new JacEvent('sendBadgeFailed', $error));
        })
    })
    .catch(($error) => {
        l.debug('Send Badge Error: ', $error);
        geb.dispatchEvent(new JacEvent('sendBadgeFailed', $error));
    });

});

function handleReadyStateChange($evt) {
    l.debug('Ready State Change: ', $evt.target.readyState);
    if($evt.target.readyState === 'interactive'){
        uiManager.init();
        reqManager.getRecentBadges()
        .then(($response) => {
            if($response.status === Status.SUCCESS){
                geb.dispatchEvent(new JacEvent('newrecentbadges', $response.data));
            } else {
                l.error('Unknown response status: ', $response.status);
            }
        })
        .catch(($error) => {
            geb.dispatchEvent(new JacEvent('errorevent', $error.data));
        });
    } else if($evt.target.readyState === 'complete'){
        l.debug('Document Complete');
        document.removeEventListener('readystatechange', handleReadyStateChange,false);
    }
}
