import {
    App,
	Vault,
    Editor,
    MarkdownView,
    Modal,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
    FuzzySuggestModal,
    TFile,
    MarkdownPostProcessorContext,
} from 'obsidian';


import * as views   from './views';
import Database from 'utils/Database';
import { Settings } from './settings';


import {
    FileManager,
} from 'utils';


const DEFAULT_SETTINGS : Settings = {
    LogPath: "Food/Logs",
    RecipePath: "Food/Recipes",
    CookPath: "Food/Logs/Cooks.yaml",
}



export default class RecipeFramework extends Plugin {

    settings: Settings;
    database: Database;

    /**
     *
     **/
    async onload() {
        FileManager.init(this.app.vault);
        
        await this.loadSettings();

        
		// ???
        this.db = new Database(this.settings.RecipePath, this.settings.CookPath);

		// Load the recipe database
		this.app.workspace.onLayoutReady(() => {
  //           this.db.init();
		// 	this.db.load();
		});

        // Register markdown clode block processors
        this.registerMarkdownCodeBlockProcessor("recipe-mealplan",  (source, container) => new views.MealPlanView (this, source, container).processMarkdown());
        this.registerMarkdownCodeBlockProcessor("recipe-mealplan-v2",  (source, container) => new views.MealPlanViewV2 (this.db, source, container).processMarkdown());
        // this.registerMarkdownCodeBlockProcessor("recipe-recommend", (source, container) => new views.RecommendView(this, source, container).processMarkdown());
        // this.registerMarkdownCodeBlockProcessor("recipe-genres",    (source, container) => new views.GenresView   (this, source, container).processMarkdown());
        // this.registerMarkdownCodeBlockProcessor("recipe-index",     (source, container) => new views.IndexView    (this, source, container).processMarkdown());
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
};

