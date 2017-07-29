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
import Status from 'general/Status';
import ErrorManager from 'general/ErrorManager';
import ReadyManager from 'ready/ReadyManager';

//import through loaders
import '../css/normalize.css';
import '../css/main.css';

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL | VerboseLevel.LINE);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

//Wait for Ready
let readyManager = new ReadyManager();
readyManager.ready()
.then(($response) => {

    //Setup Event Buses
    let geb = new GlobalEventBus();
    let uigeb = new UIGEB();

    //Setup managers
    let errManager = new ErrorManager(document);
    let uiManager = new UIManager(document);
    let swManager = new ServiceWorkerManager();
    let reqManager = new TeamPageRequestManager();


    //Set up listeners
    uigeb.addEventListener('requestunblockuser', ($evt) => {
        let evtId = $evt.id;
        l.debug('Event ID: ', evtId);
        reqManager.setBlockStatus($evt.data, false)
            .then(($response) => {
                l.debug('Completing request unblock user: ', $response);
                geb.dispatchEvent(new JacEvent('newblockuserstatus', $response.data));
                uigeb.completeUIEvent(evtId, $response);
            })
            .catch(($error) => {
                geb.dispatchEvent(new JacEvent('errorevent', $error));
            });
    });

    geb.addEventListener('requestmemberlist', ($evt) => {
        reqManager.getMembers($evt.data)
            .then(($response) => {
                if($response.status === Status.SUCCESS){
                    geb.dispatchEvent(new JacEvent('newmemberlist', $response.data));
                } else {
                    l.error('Unknown response status: ', $response.status);
                }
            })
            .catch(($error) => {
                geb.dispatchEvent(new JacEvent('errorevent', $error));
            })
    });

    geb.addEventListener('requestteamlist', ($evt) => {
        l.debug('Caught Request Team List');
        reqManager.getTeams()
            .then(($response) => {
                if($response.status === Status.SUCCESS){
                    geb.dispatchEvent(new JacEvent('newteamlist', $response.data));
                } else {
                    l.error('Unknown response status: ', $response.status);
                }
            })
            .catch(($error) => {
                l.debug('team list error: ', $error);
                geb.dispatchEvent(new JacEvent('errorevent', $error));
            });
    });

    geb.addEventListener('newteamcreated', ($evt) => {
        l.debug('Caught New Team Created');
        geb.dispatchEvent(new JacEvent('requestteamlist'));
    });

    geb.addEventListener('requestmainpage', ($evt) => {
        l.debug('caught request main page');
        window.location = '/';
    });

    uigeb.addEventListener('requestchangemodstatus', ($evt) => {
        l.debug('caught request change mod status:', $evt.data);
        let evtId = $evt.id;
        l.debug('Event ID: ', evtId);
        reqManager.setModStatus($evt.data.memberId, $evt.data.teamId, $evt.data.newIsModStatus)
            .then(($response) => {
                if($response.status === Status.SUCCESS){
                    l.debug('Success: ', $response);
                    geb.dispatchEvent(new JacEvent('newmodstatus', $response.data));
                    uigeb.completeUIEvent(evtId, $response);
                } else {
                    l.error('Unknown response status: ', $response.status);
                }
            })
            .catch(($error) => {
                geb.dispatchEvent(new JacEvent('errorevent', $error));
            });
    });

    uigeb.addEventListener('requestblockstatuschange', ($evt) => {
        l.debug('caught request change block status: ', $evt.data);
        let evtId = $evt.id;
        l.debug('Event ID: ', evtId);
        reqManager.setBlockStatus($evt.data.memberId, $evt.data.newIsBlockedStatus)
            .then(($response) => {
                if($response.status === Status.SUCCESS){
                    l.debug('Completing request block status change: ', $response);
                    geb.dispatchEvent(new JacEvent('newblockuserstatus', $response.data));
                    uigeb.completeUIEvent(evtId, $response);
                } else {
                    l.error('Unknown response status: ', $response.status);
                }
            })
            .catch(($error) => {
                geb.dispatchEvent(new JacEvent('errorevent', $error));
            })
    });

    uigeb.addEventListener('requestsendinvite', ($evt) => {
        l.debug('caught send invite request: ', $evt.data) ;
        let evtId = $evt.id;
        l.debug('Event ID: ', evtId);
        reqManager.sendTeamInvite($evt.data.emailAddress, $evt.data.teamId)
            .then(($response) => {
                if($response.status === Status.SUCCESS){
                    l.debug('Status: ', $response.status);
                    geb.dispatchEvent(new JacEvent('newinviteuserstatus', $response.data));
                    uigeb.completeUIEvent(evtId, $response);
                } else {
                    l.error('Unknown response status: ', $response.status);
                }
            })
            .catch(($error) => {
                geb.dispatchEvent(new JacEvent('errorevent', $error));
            });
    });

    uigeb.addEventListener('requestremovemember', ($evt) => {
        l.debug('caught request to remove member: ', $evt.data);
        let evtId = $evt.id;
        l.debug('Event ID: ', evtId);
        reqManager.removeMember($evt.data.memberId, $evt.data.teamId)
        .then(($response) => {
            if($response.status === Status.SUCCESS){
                l.debug('Status: ', $response.status);
                geb.dispatchEvent(new JacEvent('teammemberremoved', $response.data));
                uigeb.completeUIEvent(evtId, $response);
            } else {
                l.error('Unknown Response Status: ', $response.status);
            }
        })
        .catch(($error) => {
            getb.dispatchEvent(new JacEvent('errorevent', $error));
        });
    });

    geb.addEventListener('requestchangeteamnotifications', ($evt) => {
        l.debug('caught request change team notifications');
        reqManager.setTeamNotificationsStatus($evt.data.teamId, $evt.data.newTeamNotificationsStatus)
            .then(($response) => {
                l.debug('Response: ', $response);
                if($response.status === Status.SUCCESS){
                    //TODO: Dispatch UI completion event?
                    l.debug('Status: ', $response.status);
                } else {
                    l.error('Unknown response status: ', $response.status);
                }
            })
            .catch(($error) => {
                geb.dispatchEvent(new JacEvent('errorevent', $error));
            });
    });

    geb.addEventListener('newblockuserstatus', ($evt) => {
        l.debug('caught new block user status');
        reqManager.getBlockedMembers()
            .then(($response) => {
                if($response.status === Status.SUCCESS){
                    geb.dispatchEvent(new JacEvent('newblockedmemberlist', $response.data));
                } else {
                    l.error('Unknown response status: ', $response.status);
                }
            })
            .catch(($error) => {
                geb.dispatchEvent(new JacEvent('errorevent', $error));
            });
    });

    geb.addEventListener('requestcreateteam', ($evt) => {
        l.debug('caught request create team');
        reqManager.createTeam($evt.data.teamName)
            .then(($response) => {
                if($response.status === Status.SUCCESS){
                    geb.dispatchEvent(new JacEvent('newteamcreated', $response.data));
                } else {
                    l.error('Unknown response status: ', $response.status);
                }
            })
            .catch(($error) => {
                geb.dispatchEvent(new JacEvent('errorevent', $error));
            });
    });

    //Kick Off Managers
    uiManager.init();
    errManager.init();

    //Request Teams
    l.debug('Requesting Teams');
    geb.dispatchEvent(new JacEvent('requestteamlist'));

    //Get Blocked Members
    reqManager.getBlockedMembers()
    .then(($response) => {
        if($response.status === Status.SUCCESS){
            geb.dispatchEvent(new JacEvent('newblockedmemberlist', $response.data));
        } else {
            l.error('Unknown response status: ', $response.status);
        }
    })
    .catch(($error) => {
        geb.dispatchEvent(new JacEvent('errorevent', $error));
    });

    l.debug('New Team Page');
})
.catch(($error) => {
    l.error('Ready Error: ', $error);
});



//TODO: Move these into ready state change handler (need to wait on the dom)



