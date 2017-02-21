/**
 * Created by Jake on 2/20/2017.
 */
import l from 'jac/logger/Logger';
import JACEvent from 'jac/events/JacEvent';
import EventDispatcher from 'jac/events/EventDispatcher';

class UIManager extends EventDispatcher {
    constructor(){
        super();
    }

    testEvent(){
        this.dispatchEvent(new JACEvent('test'));
    }
}

module.exports = UIManager;