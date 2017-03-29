/**
 * Created by Jake on 3/28/2017.
 */
export default class Status {
    static get SUCCESS(){return 'SUCCESS';}
    static get ERROR(){return 'ERROR';}

    constructor(){
        throw('Status object is not meant to be newed up');
    }

}
