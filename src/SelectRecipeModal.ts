import {
	FuzzySuggestModal,
	TFile,
} from 'obsidian';

import {DateTime} from 'luxon';
import MealPlan from './MealPlan';

export default class SelectRecipeModal extends FuzzySuggestModal<TFile> {

	recipepath : string;
	logpath : string;
	
	mealplan : MealPlan;
	timestamp : string;


    constructor(mealplan : MealPlan, recipepath : string, logpath : string, timestamp : string) {
		super(mealplan.app);

		this.mealplan = mealplan;
		this.recipepath = recipepath;
		this.logpath = logpath;
		this.timestamp = timestamp;

	// 	super.inputEl.addEventListener("keydown", (event:KeyboardEvent) => {
	// 		if (event.shiftKey && event.key == "Enter") {
	// 			const recipeName = super.inputEl.value;
	// 			super.app.vault.create(`${this.plugin.settings.RecipePath}/${recipeName}.md`, "");
	// 			(this.plugin.recipeLog[this.timestamp.toISODate()] ||= []).push(recipeName);
	// 			this.plugin.renderMealPlan();
	// 			this.plugin.writeRecipeLog();
	// 			super.close();
	// 		}
	// 	});
	}
 

	/**
	 *
	 **/
	getItems() : TFile[] {
		return this.app.vault.getMarkdownFiles().filter((x:TFile) => {
			return (x?.parent?.path == this.recipepath);
		});
	}

	getItemText(file : TFile) : string {
		return file.basename;
	}

	onChooseItem(file : TFile, event : MouseEvent|KeyboardEvent) {
		const recipeName = file.basename;
		
		this.mealplan.recipelog.add(this.timestamp, recipeName);
		this.mealplan.renderMealPlan();
		this.mealplan.recipelog.write(this.logpath);
		super.close();
	}
};
