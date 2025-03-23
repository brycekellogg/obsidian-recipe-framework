import {
    App,
    FrontMatterCache,
    TAbstractFile,
    TFile,
} from 'obsidian';


// 
type CallbackCreate = (path: string) => void;
type CallbackModify = (path: string) => void;
type CallbackDelete = (path: string) => void;
type CallbackRename = (path: string, oldPath: string) => void;
type CallbackAny = CallbackCreate | CallbackModify | CallbackDelete | CallbackRename;


export type FrontMatter = {
    [index: string]: string|string[];
}


/**
 * A helper class that provides abstractions for dealing with files.
 *
 * - finding files
 * - reading files
 * - writing files
 * - getting file metadata
 * - providing callbacks on file events
 */
export default class FileManager {

    static app: App;

    static callbacksCreate: Map<string, CallbackCreate[]> = new Map<string, CallbackCreate[]>();
    static callbacksModify: Map<string, CallbackModify[]> = new Map<string, CallbackModify[]>();
    static callbacksDelete: Map<string, CallbackDelete[]> = new Map<string, CallbackDelete[]>();
    static callbacksRename: Map<string, CallbackRename[]> = new Map<string, CallbackRename[]>();


    /**
     *
     *
     */
    static init(app: App) {
        this.app = app;
        this.app.vault.on('create', this.handleCallback.bind(this, this.callbacksCreate));
        this.app.vault.on('modify', this.handleCallback.bind(this, this.callbacksModify));
        this.app.vault.on('delete', this.handleCallback.bind(this, this.callbacksDelete));
        this.app.vault.on('rename', this.handleCallback.bind(this, this.callbacksRename));
    }

    
    /*
     *
     */
    static onCreate = this.registerCallback.bind(this, this.callbacksCreate);
    static onRename = this.registerCallback.bind(this, this.callbacksRename);
    static onModify = this.registerCallback.bind(this, this.callbacksModify);
    static onDelete = this.registerCallback.bind(this, this.callbacksDelete);
    static registerCallback(map: Map<string, CallbackAny[]>, root: string, callback: CallbackAny) {
        map.get(root)?.push(callback) || map.set(root, [callback]);
    } 

    
    /*
     *
     */
    static handleCallback(callbackMap: Map<string, CallbackAny[]>, file: TAbstractFile, oldPath: string = '') {
        if (!(file instanceof TFile)) return;  // Only consider files for now
        for (const [path, callbackList] of callbackMap) {
            if (file.path.startsWith(path)) {
                for (const callback of callbackList) {
                    callback(file.path, oldPath);
                }
            }
        }
    }


    /*
     *
     */
    static async readFrontmatter(path: string): Promise<FrontMatterCache> {
        const file: TAbstractFile|null = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof TFile) {
            return new Promise((resolve) => {
                this.app.fileManager.processFrontMatter(file, (frontmatter: FrontMatterCache) => {
                    resolve(frontmatter);
                })
            })
        } else {
            throw new Error(`File not found: ${path}`);
        }
    }


    /*
     *
     */
    static async writeFrontmatter(path: string, data: {}) {
        const file: TAbstractFile|null = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof TFile) {
            this.app.fileManager.processFrontMatter(file, (frontmatter: FrontMatterCache) => {
                for (const [key, value] of Object.entries(data)) {
                    if (value) frontmatter[key] = value;
                }
            })
        }
    }


    /*
     *
     *
     */
    static async read(path: string): Promise<string> {
        const file: TAbstractFile|null = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof TFile) {
            const contents: string = await this.app.vault.cachedRead(file);
            return contents;
        } else {
            throw new Error(`File not found: ${path}`);
        }
    }


    /**
     *
     *
     */
    static async write(path: string, contents: string) {
        const file: TAbstractFile|null = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof TFile) {
            this.app.vault.modify(file, contents);
        }
    }
}
