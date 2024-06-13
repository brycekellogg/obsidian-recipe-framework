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


import * as views         from './views';
import { RecipeDatabase } from './utils';
import { Settings }       from './settings';


const DEFAULT_SETTINGS : Settings = {
    LogPath: "Food/Logs",
    RecipePath: "Food/Recipes",
}




export default class RecipeFramework extends Plugin {

    settings: Settings;

    /**
     *
     **/
    async onload() {
        await this.loadSettings();

		// Load the recipe database
		this.app.workspace.onLayoutReady(() => {
			this.db = new RecipeDatabase(this.app.vault, this.settings);
			this.db.load()
		});

        // Register markdown clode block processors
        this.registerMarkdownCodeBlockProcessor("recipe-mealplan",  (source, container) => new views.MealPlanView (this, source, container).processMarkdown());
        this.registerMarkdownCodeBlockProcessor("recipe-mealplan-v2",  (source, container) => new views.MealPlanViewV2 (this, source, container).processMarkdown());
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

