
// import { DocumentNode, ElementNode, createElement, TextNode, logger as log } from '../basicdom';
import { nodeOps } from "../nativescript-vue-next/runtime/nodeOps";
import { elementIterator, NSVComment, NSVElement, NSVNodeTypes, NSVText } from "../nativescript-vue-next/runtime/nodes";
import { RNWindow } from "../react-nodegui/src/components/Window/RNWindow";
import { warn, error, log } from '../shared/Logger';
import HeadElement from "./HeadElement";
import { RNObject } from "./RNObject";
import StyleElement from "./StyleElement";
import TemplateElement from "./TemplateElement";

export default class SvelteDesktopDocument extends NSVElement<RNObject> {
    public head: HeadElement = this.createElement('head') as HeadElement;
    private _windows: Set<NSVElement<RNWindow>> = new Set();

    constructor() {
        super("document");

        this.appendChild(this.head);

        // log(`created ${this}`)
    }

    createEvent(type: string) {
        let e: any = {};
        e.initCustomEvent = (type: string, ignored1: boolean, ignored2: boolean, detail: any) => {
            e.type = type;
            e.detail = detail;
            e.eventName = type;
        }
        return e;
    }


    get text(): string | undefined {
        error(`text() getter called on element that does not implement it.`, this);
        return void 0;
    }

    set text(t: string | undefined) {
        error(`text() setter called on element that does not implement it.`, this);
    }

    createComment(text: string): NSVComment {
        return new NSVComment(text)
    }

    // createPropertyNode(tagName: string, propertyName: string): PropertyNode {
    //     console.log(`[SvelteDesktopDocument] createPropertyNode("${tagName}", "${propertyName}")`);
    //     return new PropertyNode(tagName, propertyName)
    // }

    createElement(tagName: string): NSVElement {
        // if (tagName.indexOf(".") >= 0) {
        //     let bits = tagName.split(".", 2);
        //     return this.createPropertyNode(bits[0], bits[1]);
        // }
        // return nodeOps.createElement(tagName) as NSVElement;

        console.log(`document.createElement("${tagName}") -> new NSVElement("${tagName}")`);

        let ele: NSVElement;
        switch (tagName) {
            case "template":
                ele = new TemplateElement();
                break;
            case "style":
                ele = new StyleElement();
                break;
            case "head":
                ele = new HeadElement();
                break;
            case "document":
                ele = new SvelteDesktopDocument();
                break;
            case "window":
                ele = new NSVElement(tagName);
                this._windows.add(ele as NSVElement<RNWindow>);
                (ele.nativeView as RNWindow).setStyleSheet(this.head.getStyleSheet());
                break;
            case "fragment":
            default: {
                ele = new NSVElement(tagName);
            }
        }
        ele.ownerDocument = this;
        return ele;
    }

    createElementNS(namespace: string, tagName: string): NSVElement {
        return this.createElement(tagName)
    }

    createTextNode(text: string): NSVText {
        console.log(`[SvelteDesktopDocument] createTextNode("${text}")`);
        return new NSVText(text)
    }

    getElementById(id: string): NSVElement|null {
        for(let el of elementIterator(this)){
            if(el.nodeType === NSVNodeTypes.ELEMENT && (el as NSVElement).id === id){
                return el as NSVElement;
            }
        }
        return null;
    }

    dispatchEvent(event: any) {
        //Svelte dev fires these for tool support
    }

    addWindow(win: NSVElement<RNWindow>): void {
        this._windows.add(win);
    }
    /**
     * I'm not clear where would be a good place to call this.
     */
    deleteWindow(win: NSVElement<RNWindow>): void {
        this._windows.delete(win);
    }

    setStyleSheets(styleSheet: string): void {
        this._windows.forEach(window => {
            window.nativeView.setStyleSheet(styleSheet);
        });
    }
}
