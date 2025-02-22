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
        this.display = document.createElement('div');
        this.display.classList.add('xipper-monitor');
        this.display.innerHTML = `
            <div class="control-panel">
                <input id="phrase" type="text">
            </div>
            <div title="Xipper panel" class="xipper-icon">@@</div>`;
        this.element.parentElement.appendChild(this.display);
        this.controlPanel = this.display.querySelector('.control-panel');
        this.xipperIcon = this.display.querySelector('.xipper-icon');
        this.xipperIcon.addEventListener('click',this.activate.bind(this));
    }
    async activate(element) {
        console.log('clickety')
        this.flash();
    }
    addStyles() {
        let link = document.createElement('link');
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", '/lib/xipper/monitor/style.css');
        document.getElementsByTagName("head")[0].appendChild(link);
    }
    flash() {
        this.xipperIcon.classList.add('flash');
        setTimeout(() => {
            this.xipperIcon.classList.remove('flash');
        })
    }
};