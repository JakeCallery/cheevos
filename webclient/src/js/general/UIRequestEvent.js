/**
 * Created by Jake on 3/26/2017.
 */
import JacEvent from 'jac/events/JacEvent';

export default class UIRequestEvent extends JacEvent {
    constructor($id, $type, $data){
        super($type, $data);
        this.id = $id;
    }
}
