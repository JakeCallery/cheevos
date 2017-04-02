/**
 * Created by Jake on 4/2/2017.
 */
const ready = require('document-ready-promise');
export default class ReadyManager {
    //TODO: Make smarter / allow for a list of required features for a specific page
    //(pass in list of feature strings)
    constructor($doc){

        //List of polyFills
        this.polyFills = [
            {
                test: () => !global.fetch,
                load: () => {
                    return new Promise((resolve, reject) => {
                        require.ensure([], () => {
                            resolve({
                                fetch: require('whatwg-fetch')
                            });
                        }, 'polyfills-fetch');
                    });
                }
            }
        ];
    }

    ready(){
        let promiseList = [];

        //Wait for doc ready
        promiseList.push(ready());

        //Wait for polyfills to load
        if(this.polyFills.some(polyfill => polyfill.test())){
            this.polyFills.forEach((polyfill) => {
                if(polyfill.test()){
                    promiseList.push(polyfill.load());
                }
            });
        }

        //Kick off
        return Promise.all(promiseList);
    }
}