/**
 * Created by Jake on 2/20/2017.
 */
import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import BadgeUIMaker from 'general/BadgeUIMaker'
import GlobalEventBus from 'jac/events/GlobalEventBus';

class UIManager extends EventDispatcher {
    constructor($dom){
        super();

        //Public properties
        this.geb = new GlobalEventBus();

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
        this.serviceWorkerRegisteredDelegate = EventUtils.bind(self, self.handleSWRegistered);
        this.userSubscribedDelegate = EventUtils.bind(self, self.handleUserSubscribed);
        this.userNotSubscribedDelegate = EventUtils.bind(self, self.handleUserNotSubscribed);

        //Event Handlers
        this.profileImg.addEventListener('click', self.profileClickDelegate);
        this.geb.addEventListener('serviceWorkerRegistered', self.serviceWorkerRegisteredDelegate);
        this.geb.addEventListener('userSubscribed', self.userSubscribedDelegate);
        this.geb.addEventListener('userNotSubscribed', self.userNotSubscribedDelegate);
        this.populateRecentBadges();
    }

    handleSWRegistered() {
        l.debug('UI Caught SW Registered');
        this.isSWRegistered = true;
    }

    handleUserSubscribed(){
        l.debug('UI caught user subscribed...');
    }

    handleUserNotSubscribed(){
        l.debug('UI caught user NOT subscribed...');
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
                let badges = $res.data.badges;
                for(let i = 0; i < badges.length; i++){
                    let badge = badges[i];
                    this.badgesContainer.appendChild(
                        this.badgeUIMaker.createBadgeDiv(
                            badge.titleText,
                            badge.descText,
                            badge.senderName,
                            badge.teamName,
                            badge.iconUrl
                        )
                    );
                }
            })
            .catch(($error) => {
                l.error('ERROR: ', $error);
            })
        })
        .catch(($error) => {
            l.error('FETCH ERROR: ', $error);
        });
    }

    handleProfileClick($evt){
        l.debug('this: ', this);
        l.debug('Profile Image click');
        DOMUtils.toggleClass(this.profileOverlayContainer, 'displayNone');
    }

}

export default UIManager;