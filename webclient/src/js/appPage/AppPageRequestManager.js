/**
 * Created by Jake on 3/29/2017.
 */
import l from 'jac/logger/Logger';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import Status from 'general/Status';

export default class AppPageRequestManager extends EventDispatcher {
    constructor() {
        super();
        let self = this;
        l.debug('New App Page Request Manager');
        this.geb = new GlobalEventBus();
    }

    getRecentBadges(){
        let self = this;
        l.debug('Get Recent Badges');
        return new Promise((resolve, reject) => {
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
                return $response.json();
            })
            .then(($response) => {
                l.debug($response);
                resolve({
                    status: $response.status,
                    data: $response.data.badges
                });
            })
            .catch(($error) => {
                l.error('Get Recent Badges Error: ', $error);
                reject({
                    status: Status.ERROR,
                    data: $error
                });
            });
        });
    }

    sendBadge($badgeData){
        return new Promise((resolve, reject) => {
            fetch('/api/sendBadge', {
                method: 'POST',
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify($badgeData)
            })
            .then(($response) => {
                return $response.json();
            })
            .then(($res) => {
                l.debug('Response: ', $res);
                resolve({
                    status: $res.status
                });
            })
            .catch(($error) => {
                l.debug('Send Badge Error: ', $error);
                reject({
                    status: Status.ERROR,
                    data: $error
                });
            });
        });
    }

    getMyTeams(){
        return new Promise((resolve, reject) => {
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
                return $response.json();
            })
            .then(($response) => {
                l.debug('Response: ', $response);
                resolve({
                    status: $response.status,
                    data: $response.data
                });
            })
            .catch(($error) => {
                l.debug('List Teams Error: ', $error);
                reject({
                    status: Status.ERROR,
                    data: $error
                });
            });
        });
    }

    getTeamMembers($teamId){
         return new Promise((resolve, reject) => {
             fetch('/api/listMembers', {
                 method: 'POST',
                 credentials: 'include',
                 headers: new Headers({
                     'Content-Type': 'application/json'
                 }),
                 body: JSON.stringify({
                     teamId: $teamId
                 })
             })
             .then(($response) => {
                 l.debug('List Members API Response: ', $response);
                 return $response.json();
             })
             .then(($response) => {
                 l.debug('Response: ', $response);
                 resolve({
                    status: $response.status,
                     data: $response.data
                 });
             })
             .catch(($error) => {
                 l.error('List Members API Error: ', $error);
                 reject({
                     status: Status.ERROR,
                     data: $error
                 });
             })
         });
    }
}
