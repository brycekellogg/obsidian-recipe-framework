import {
	App,
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

import MealPlan from './MealPlan';
// import { RecipeLog } from './RecipeLog';


// Remember to rename these classes and interfaces!

interface RecipeFrameworkSettings {
	LogPath:string;
	RecipePath:string;
}

const DEFAULT_SETTINGS : RecipeFrameworkSettings = {
	LogPath: "Food/Logs",
	RecipePath: "Food/Recipes",
}




export default class RecipeFramework extends Plugin {

	settings:RecipeFrameworkSettings;
	// recipelog:RecipeLog;

	async onload() {
		await this.loadSettings();

		// Register a markdown clode block processor
		this.registerMarkdownCodeBlockProcessor("recipe-framework-mealplan", (source : string, container : HTMLElement, context : MarkdownPostProcessorContext) => {
			const mealplan = new MealPlan(this.app, container, this.settings.LogPath, this.settings.RecipePath);
			mealplan.processMarkdown();
		});
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
};


