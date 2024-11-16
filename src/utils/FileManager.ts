import {
    Vault,
    TAbstractFile,
    TFile,
    TFolder,
} from 'obsidian';

import {
    DateTime,
} from 'luxon';

type CallbackCreate = (path: string) => void;
type CallbackModify = (path: string) => void;
type CallbackDelete = (path: string) => void;
type CallbackRename = (path: string, oldPath: string) => void;

export default class FileManager {

    static vault: Vault;

    static callbacksCreate: Map<string, CallbackCreate[]> = new Map<string, CallbackCreate[]>();
    static callbacksModify: Map<string, CallbackModify[]> = new Map<string, CallbackModify[]>();
    static callbacksDelete: Map<string, CallbackDelete[]> = new Map<string, CallbackDelete[]>();
    static callbacksRename: Map<string, CallbackRename[]> = new Map<string, CallbackRename[]>();


    /**
     *
     *
     */
    static init(vault: Vault) {
        this.vault = vault;
        this.vault.on('create', this.handleCallback.bind(this, this.callbacksCreate));
        this.vault.on('modify', this.handleCallback.bind(this, this.callbacksModify));
        this.vault.on('delete', this.handleCallback.bind(this, this.callbacksDelete));
        this.vault.on('rename', this.handleCallback.bind(this, this.callbacksRename));
    }

    
    /*
     *
     */
    static onCreate = this.registerCallback.bind(this, this.callbacksCreate);
    static onRename = this.registerCallback.bind(this, this.callbacksRename);
    static onModify = this.registerCallback.bind(this, this.callbacksModify);
    static onDelete = this.registerCallback.bind(this, this.callbacksDelete);
    static registerCallback(map, root, callback) {
        map.get(root)?.push(callback) || map.set(root, [callback]);
    } 

    
    /*
     *
     */
    static handleCallback(callbackMap, file: TFile, oldPath: string) {
        for (const [path, callbackList] of callbackMap) {
            if (file.path.startsWith(path)) {
                for (const callback of callbackList) {
                    callback(file.path, oldPath);
                }
            }
        }
    }

     
    /*
     * Find files.
     *
     * This function examines the children of the root TFolder and either adds
     * them to the list of recipes or recurses if the child is a TFolder. This
     * allows recipes to be nested in subfolders.
     *
     * Note: this function considers all files to be recipes. There
     *       is currently no checking of file extension or content.
     *
     * Params:
     *    - root = the root folder in which to look for recipes
     *    - exts = a list of file extension to match
     *
     * Returns: a list of files corresponding to all the recipes
     *          recursively found under the root folder.
     */
    static findFiles(rootPath: string, exts: string[] = []): string[] {
        const root: TAbstractFile|null = this.vault.getAbstractFileByPath(rootPath);

        // If it's not found, return empty list
        if (root == null) return [];
        
        // If it's a file, return its path unless the extension doesn't match
        if (root instanceof TFile) {
            return exts.includes(root.extension) ? [root.path] : [];
        }
        
        let fileList: string[] = [];
        for (const child of (root as TFolder).children) {
            fileList = [...fileList, ...this.findFiles(child.path, exts)];
        }

        return fileList;
    }


    /**
     *
     *
     */
    static modified(path: string): DateTime|undefined {
        return DateTime.now();
    }
    

    /**
     *
     *
     */
    static async read(path: string): Promise<string> {
        const file: TAbstractFile|null = this.vault.getAbstractFileByPath(path);
        if (file instanceof TFile) {
            const contents: string = await this.vault.cachedRead(file);
            return contents;
        } else {
            return '';
        }
    }

    static async write(path: string, contents: string) {
        const file: TAbstractFile|null = this.vault.getAbstractFileByPath(path);
        if (file instanceof TFile) {
            this.vault.modify(file, contents);
        }
    }


}
