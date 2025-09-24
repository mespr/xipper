/**
 * XipperMonitor can be added to a text input field. It applies xipper
 * encoding and pass phrase handling
 */
import Xipper from './Xipper.mjs';
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
        this.phraseInput.addEventListener('keypress',this.typing.bind(this));
        this.phraseInput.addEventListener('blur',this.applyPhrase.bind(this));
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
        if (event.code === "Enter") await this.applyPhrase();
    }
    async applyPhrase() {
        if (this.phraseInput.value === "") this.xipper.store.remove(this.name);
        this.xipper.store.put(this.name,this.phraseInput.value);
        if (this.options.onupdate) this.options.onupdate()
    }
    addStyles() {
        let style = document.createElement('style');
        style.innerText = styles;
        document.getElementsByTagName("head")[0].appendChild(style);
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
        return (this.phraseInput.value || this.xipper.store.get(this.name))?.toLowerCase();
    }
    async render(content) {
        try {
            content = await this.xipper.decloakBlock(this.activePhrase,content,'');
            this.activate(false);
        } catch(e) {
            this.flash();
            this.activate(true);
            content = content.replace(/@@((\n|\r|.)*?)@@/gm,"$1")
        }
        return content;
    }
};

const styles = `
.xipper-monitor {
    position:absolute;
    display:none;
    flex-direction:row;
    top:0;
    right:0;
    cursor:pointer;
    padding:var(--spacer) var(--spacer2);
}
.xipper-monitor.reveal {
    display:flex;
}
.xipper-monitor .xipper-icon {
    flex:0;
    letter-spacing: -10px;
    font-size:18px;
    align-self: center;
    font-family:sans-serif;
    user-select: none;
    padding-right:var(--spacer);
    transition:0.2s color;
    font-size: 1.3em;
}
.xipper-monitor .control-panel {
    display:none;
    flex:1;
    min-width:150px;
    font-size:12px;
}
.xipper-monitor.expand .control-panel {
    display: flex;
}
.xipper-monitor .control-panel input {
    font-size:12px;
    padding:2px;
    border-color:var(--bg-color-d);
}
.xipper-monitor .xipper-icon.flash {
    color:#aa0000;
}`;
