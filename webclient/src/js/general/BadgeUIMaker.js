/**
 * Created by Jake on 2/25/2017.
 */
import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventDispatcher from 'jac/events/EventDispatcher';

class BadgeUIMaker extends EventDispatcher {
    constructor($doc){
        super();

        this.doc = $doc;

        l.debug('new BageUIMaker');
    }

    createBadgeDiv($title, $desc, $senderName, $senderId, $team, $iconUrl) {
        let badgeContainer = this.doc.createElement('div');
        DOMUtils.addClass(badgeContainer, 'badgeContainer');

        //Badge Icon
        let img = this.doc.createElement('img');
        img.src = $iconUrl;
        img.width = 128;
        img.height = 128;

        //Title
        let titleP = this.doc.createElement('p');
        titleP.textContent = $title;

        //Desc
        let descP = this.doc.createElement('p');
        descP.textContent = $desc;

        //Team
        let teamP = this.doc.createElement('p');
        teamP.textContent = $team;

        //Sender
        let senderP = this.doc.createElement('p');
        senderP.textContent = $senderName;

        //Block User
        let blockButton = this.doc.createElement('button');
        blockButton.blockId = $senderId;
        blockButton.textContent = 'Block User';
        blockButton.addEventListener('click', ($evt) => {
            l.debug('Block Button Clicked: ', $evt.target.blockId);
            fetch('/api/blockUser', {
                method: 'POST',
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    userIdToBlock: $evt.target.blockId
                })
            })
            .then(($response) => {
                $response.json()
                .then(($res) => {
                    l.debug('Response: ', $res);
                })
                .catch(($error) => {
                    l.error('PARSE ERROR: ', $error);
                });
            })
            .catch(($error) => {
                l.error('Block User Error: ', $error);
            })
        });

        //Combine
        badgeContainer.appendChild(img);
        badgeContainer.appendChild(titleP);
        badgeContainer.appendChild(descP);
        badgeContainer.appendChild(teamP);
        badgeContainer.appendChild(senderP);
        badgeContainer.appendChild(blockButton);

        return badgeContainer;
    }

}

module.exports = BadgeUIMaker;