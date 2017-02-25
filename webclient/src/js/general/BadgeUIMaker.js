/**
 * Created by Jake on 2/25/2017.
 */
import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';

class BadgeUIMaker extends EventDispatcher {
    constructor($dom){
        super();

        this.dom = $dom;

        l.debug('new BageUIMaker');
    }

    createBadgeDiv($title, $desc, $senderName, $team, $iconUrl) {
        let badgeContainer = this.dom.createElement('div');
        DOMUtils.addClass(badgeContainer, 'badgeContainer');

        //Badge Icon
        let img = this.dom.createElement('img');
        img.src = $iconUrl;
        img.width = 128;
        img.height = 128;

        //Title
        let titleP = this.dom.createElement('p');
        titleP.textContent = $title;

        //Desc
        let descP = this.dom.createElement('p');
        descP.textContent = $desc;

        //Team
        let teamP = this.dom.createElement('p');
        teamP.textContent = $team;

        //Sender
        let senderP = this.dom.createElement('p');
        senderP.textContent = $senderName;

        //Combine
        badgeContainer.appendChild(img);
        badgeContainer.appendChild(titleP);
        badgeContainer.appendChild(descP);
        badgeContainer.appendChild(teamP);
        badgeContainer.appendChild(senderP);

        return badgeContainer;
    }

}

module.exports = BadgeUIMaker;