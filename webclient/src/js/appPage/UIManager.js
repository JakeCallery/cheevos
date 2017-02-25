/**
 * Created by Jake on 2/20/2017.
 */
import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import BadgeUIMaker from 'general/BadgeUIMaker'

class UIManager extends EventDispatcher {
    constructor($dom){
        super();

        //DOM Elements
        this.dom = $dom;

        //Managers
        this.badgeUIMaker = new BadgeUIMaker(this.dom);
    }

    init(){
        l.debug('UI Manager Init');

        //DOM ELEMENTS
        this.profileImg = this.dom.getElementById('profileImg');
        this.profileOverlayContainer = this.dom.getElementById('profileOverlayContainer');
        this.badgesContainer = this.dom.getElementById('badgesContainer');

        //Delegates
        let self = this;
        this.profileClickDelegate = EventUtils.bind(self, self.handleProfileClick);

        //Event Handlers
        this.profileImg.addEventListener('click', self.profileClickDelegate);

        this.populateRecentBadges();

    }

    populateRecentBadges(){
        l.debug('Populate Recent Badges');
        fetch('api/listMyBadges', {
            method:'POST',
            credentials: 'include',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
            })
        })
        .then(($response) => {
            $response.json()
            .then(($res) => {
                l.debug($res);
                this.badgesContainer.appendChild(
                    this.badgeUIMaker.createBadge(
                        'Test Title',
                        'This is a super Sweet test description and stuff',
                        'Mr. Sender',
                        'Team Ballz',
                        '/testBadgeIcon.png'
                    )
                )

            })
            .catch(($error) => {
                l.error('ERROR: ', $error);
            })
        })
        .catch(($error) => {

        });
    }

    handleProfileClick($evt){
        l.debug('this: ', this);
        l.debug('Profile Image click');
        DOMUtils.toggleClass(this.profileOverlayContainer, 'displayNone');
    }

}

module.exports = UIManager;