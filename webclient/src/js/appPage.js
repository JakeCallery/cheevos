/**
 * Created by Jake on 2/7/2017.
 */

import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';

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

l.debug('New App Page');