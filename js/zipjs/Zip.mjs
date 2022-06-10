import Deflate from './deflate.mjs';
import Inflate from './inflate.mjs';
import array from './array.mjs';

export default class Zip {
    constructor() {
        array();
        this.inflate = Inflate;
        this.deflate = Deflate;
    }
}