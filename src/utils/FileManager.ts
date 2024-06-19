import {
    Vault,
    TAbstractFile,
    TFile,
    TFolder,
} from 'obsidian';

import {
    DateTime,
} from 'luxon';


export default class FileManager {

    static vault: Vault;


    /**
     *
     *
     */
    static init(vault: Vault) {
        this.vault = vault;
    }


    /**
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
    // static findFiles(root: TFolder, exts: string[] = []): TFile[] {
    //     let fileList: TFile[] = [];
    //     
    //     for (const child: TAbstractFile of root.children) {
    //         if (child instanceof TFolder) fileList = [...fileList, ...this.findFiles(child, exts)];
    //         if (child instanceof TFile && exts.includes(child.extension)) fileList = [...fileList, child];
    //     }
    //     
    //     return fileList;
    // }


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
    //     const file: TFile = this.vault.getFileByPath(path);
    //     const contents: string = await this.vault.cachedRead(file);
    //     return contents;
        return "";
    }
}
