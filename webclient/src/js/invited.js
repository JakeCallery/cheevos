/**
 * Created by Jake on 1/1/2017.
 */

import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';

import '../css/main.css';

//TODO: Wait for dom ready

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL | VerboseLevel.LINE);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

l.debug('Invited Page JS Works!');

const acceptInviteButton = document.getElementById('acceptInviteButton');
let inviteCode = document.getElementById('codeP').textContent;
l.debug('InviteCode: ' + inviteCode);

acceptInviteButton.addEventListener('click', ($event) => {
    l.debug('Accept Click');

    fetch('/api/acceptInvite', {
        method: 'POST',
        credentials: 'include',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            inviteCode: inviteCode
        })
    })
    .then(($response) => {
        l.debug('Resposne: ', $response);
    })
    .catch(($error) => {
        l.error('Error: ', $error);
    });

});