/**
 * XipperMonitor can be added to a text input field. It applies xipper
 * encoding and pass phrase handling
 */
import Xipper from '/lib/xipper/Xipper.mjs';
export default class XipperMonitor {
    constructor(element) {
        this.xipper = new Xipper();
        this.element = element;
        this.addStyles()
        this.renderTag = document.createElement("div");
        this.renderTag.classList.add("xipper-monitor");
        this.renderTag.innerText='@@';
        this.renderTag.title = '[xipper] enter pass phrase'
        this.renderTag.addEventListener('click',this.activate.bind(this));
        this.element.parentElement.append(this.renderTag);
    }
    async activate(element) {
        console.log('clickety')
    }
    addStyles() {
        let link = document.createElement('link');
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", '/lib/xipper/monitor/style.css');
        document.getElementsByTagName("head")[0].appendChild(link);
    }
};