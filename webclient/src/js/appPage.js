/**
 * Created by Jake on 2/7/2017.
 */

import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';
import UIManager from 'appPage/UIManager';

//Import Service worker through loader
import swURL from "file-loader?name=service-worker.js!babel-loader!./service-worker";

//Import through loaders
import 'file-loader?name=manifest.json!./manifest.json';
import '../css/main.css';
import 'file-loader?name=icon.png!../images/icon.png';
import 'file-loader?name=badge.png!../images/badge.png';

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL | VerboseLevel.LINE);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

let isSubscribed = false;
let swRegistration = null;

//TODO: Find a way to put this in as external (file loader)
let applicationServerPublicKey = 'BETix3nG7KB6YIvsG0kTrs3BGv5_ebD9X5Wg-4ebcOjd0E2Wp1SGJfdD--El1bxEaINOASoipqZF_qqFe0S51n8';

//DOM Elements
let profileImg = document.getElementById('profileImg');

document.addEventListener('readystatechange', handleReadyStateChange ,false);

function handleReadyStateChange($evt) {
    l.debug('Ready State Change: ', $evt.target.readyState);
    if($evt.target.readyState === 'complete'){
        document.removeEventListener('readystatechange', handleReadyStateChange,false);
        enableUI();
    }
}

function enableUI(){
    l.debug('ENABLE UI Called');
}

l.debug('New App Page');

let uiManager = new UIManager();
uiManager.addEventListener('test', ($evt) => {
    l.debug('Caught Test');
});
uiManager.testEvent();
