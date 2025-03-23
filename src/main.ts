import {
    Plugin,
} from 'obsidian';

import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

import {
    Database
} from 'utils/Database';

import {
    createElement
} from 'react';

import {
    MealPlanView
} from './views';

import 
    MealPlan
 from './views/MealPlanView';

import {
    DEFAULT_SETTINGS,
    Settings,
    RecipeFrameworkSettingsTab,
} from 'Settings';

import {
    FileManager,
} from 'utils';

import {
    createRoot
} from 'react-dom/client';



// TODO: add unit test markdown code block since jest isn't working well
export default class RecipeFramework extends Plugin {

    settings: Settings = DEFAULT_SETTINGS;

    /*
     *
     */
    async onload() {

        await this.loadSettings();


        // Initialize sqlite3 WebAssembly for use by the database. We do this
        // here instead of in the Database because we need access to the
        // Obsidian App/Vault to get the full resource path of the .wasm
        const sqlite3 = await sqlite3InitModule({
            print: (_) => {},
            // printErr: console.error,
            locateFile: (path: string) => this.app.vault.adapter.getResourcePath(`${this.manifest.dir}/${path}`)
        });


        // Initialize the file manager & database
        //
        // When Obsidian loads the vault, each file will trigger a 'create' event
        // as they are loaded by Obsidian. To instead only catch actual file
        // creation events, we need to register event handlers in the "layout-ready"
        // event callback.
        //
        // More info: https://docs.obsidian.md/Reference/TypeScript+API/Vault/on('create')
        FileManager.init(this.app);
        Database.init(this.settings.RecipePath, sqlite3);


        // Register the 
        this.registerMarkdownCodeBlockProcessor("gastronomy-mealplan",  (source, container) => {
            createRoot(container).render(createElement(MealPlan));

            //new MealPlanView (source, container);
        });


        this.app.workspace.onLayoutReady(() => {
            //Database.onChange(() => {
                //console.log(Database.recipes.all());
            //})
            //console.log(Database.recipes.all());
        });

        //  ?????
		this.addSettingTab(new RecipeFrameworkSettingsTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
};




        // this.registerMarkdownCodeBlockProcessor('recipe-query',        (source, container) => new views.RecipeQueryView(source, container));
        // this.registerMarkdownCodeBlockProcessor("recipe-recommend", (source, container) => new views.RecommendView(this, source, container).processMarkdown());
        // this.registerMarkdownCodeBlockProcessor("recipe-genres",    (source, container) => new views.GenresView   (this, source, container).processMarkdown());
        // this.registerMarkdownCodeBlockProcessor("recipe-index",     (source, container) => new views.IndexView    (this, source, container).processMarkdown());
        // this.registerMarkdownCodeBlockProcessor('recipe-mealplan-v2',  (source, container) => new views.MealPlanViewV2 (source, container));
        // this.registerMarkdownCodeBlockProcessor('recipe-mealplan-v3',  (source, container) => new views.MealPlanViewV3 (source, container));
