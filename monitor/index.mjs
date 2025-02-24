/**
 * XipperMonitor can be added to a text input field. It applies xipper
 * encoding and pass phrase handling
 */
import Xipper from '/lib/xipper/Xipper.mjs';
export default class XipperMonitor {
    constructor(name,options={}) {
        this.name = name;
        this.options = options;
        this.xipper = this.options.xipper || new Xipper();
        this.addStyles();
        this.display = document.createElement('div');
        this.display.classList.add('xipper-monitor');
        this.display.innerHTML = `
            <div title="xipper panel" class="xipper-icon">@@</div>
            <div class="control-panel">
                <input id="phrase" type="text" placeholder="Enter pass phrase for @@">
<!--                <span id="applyPhrase" class="icon icon-arrow-right"></span>-->
            </div>`
        if (!this.options.hide) this.reveal();
        this.controlPanel = this.display.querySelector('.control-panel');
        this.xipperIcon = this.display.querySelector('.xipper-icon');
        this.xipperIcon.addEventListener('click',this.activate.bind(this));
        this.phraseInput = this.display.querySelector('input');
        this.phraseInput.value = this.xipper.store.get(this.name);
        this.phraseInput.addEventListener('keyDown',this.typing.bind(this));
        this.phraseInput.addEventListener('blur',this.updatePhrase.bind(this));
        // this.display.querySelector('#applyPhrase').addEventListener('click',this.applyPhrase.bind(this));
    }
    attach(element) {
        this.element = element;
        this.element.parentElement.appendChild(this.display);
    }
    async activate(force) {
        if (force===true) this.display.classList.add('expand');
        else if (force===false) this.display.classList.remove('expand');
        else this.display.classList.toggle('expand');
    }
    async typing(event) {
        console.log("key: "+event.code);
        if (event.code === "Enter") await this.applyPhrase();
    }
    async updatePhrase(event) {
        if (this.phraseInput.value == "") this.xipper.store.remove(this.name);
        else this.xipper.store.put(this.name,this.phraseInput.value);
    }
    async applyPhrase() {
        this.xipper.store.put(this.name,this.phraseInput.value);
        await this.render();
    }
    addStyles() {
        let link = document.createElement('link');
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", '/lib/xipper/monitor/style.css');
        document.getElementsByTagName("head")[0].appendChild(link);
    }
    flash() {
        this.reveal();
        this.xipperIcon.classList.add('flash');
        setTimeout(() => {
            this.xipperIcon.classList.remove('flash');
        },500)
    }
    hide() {
        this.display.classList.remove('reveal');
    }
    reveal() {
        this.display.classList.add('reveal');
    }
    get activePhrase() {
        return this.phraseInput.value || this.xipper.store.get(this.name)
    }
    async render(content) {
        try {
            content = await this.xipper.decloakBlock(this.activePhrase,content,'');
        } catch(e) {
            this.flash();
            this.activate(true);
            content = content.replace(/@@((\n|\r|.)*?)@@/gm,"$1")
        }
        return content;
    }
};