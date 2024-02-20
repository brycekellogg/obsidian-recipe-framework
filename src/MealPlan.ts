import {
	App,
	TFile,
} from 'obsidian';

import { Eta } from 'eta';
import {DateTime} from 'luxon';

import RecipeLog from './RecipeLog';
import SelectRecipeModal from './SelectRecipeModal';

/**
 *
 *
 **/
const templateMealPlan = `<div>
    <table>
        <tbody>
            <% for (let date = it.start; date <= it.end; date = date.plus({'days':1})) { %>
                <%~ include("@mealPlanRow", {timestamp: date, recipes: it.log.get(date.toISODate())}) %>
            <% } %>
        </tbody>
    </table>
</div>
`;


/**
 *
 */
const templateMealPlanRow = `<tr data-timestamp="<%= it.timestamp.toISODate() %>">
    <td><p><%~ it.timestamp.toFormat('LLL d') %></p></td>
    <td><p><%~ it.timestamp.toFormat('ccc')   %></p></td>
    <td class="meal-plan-recipe-list"><div class="meal-plan-recipe-list">
        <% it.recipes?.forEach(function(_){ %>
            <%~ include("@mealPlanEntry", _) %>
        <% }) %>
    </div></td>
</tr>
`;


/**
 *
 **/
const templateMealPlanEntry = `<div class="multi-select-pill internal-link" data-name="<%= it %>">
    <div class="multi-select-pill-content"><%= it %></div>
    <div class="multi-select-pill-remove-button">
        <svg xmlns="http://www.w3.org/2000/svg"
             width="24" height="24"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             stroke-width="2"
             stroke-linecap="round"
             stroke-linejoin="round"
             class="svg-icon lucide-x">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
        </svg>
    </div>
</div>
`;


export default class MealPlan {

	// ???
	recipelog : RecipeLog;

	// ???
	eta : Eta;

	// ???
	container:HTMLElement;

	logpath : string;
	recipepath : string;

	app : App;

	/**
	 *
	 **/
	constructor(app : App, container : HTMLElement, logpath : string, recipepath : string) {
		this.container = container;

		this.eta = new Eta();
		this.eta.loadTemplate("@mealPlan", templateMealPlan);
		this.eta.loadTemplate("@mealPlanRow", templateMealPlanRow);
		this.eta.loadTemplate("@mealPlanEntry", templateMealPlanEntry);

		this.logpath = logpath;
		this.recipepath = recipepath;
		this.recipelog = new RecipeLog(app);

		this.app = app;
	}

	
	/**
	 *
	 **/
	async handleMealPlanClick(event:MouseEvent) {
		const add = (event.target as HTMLElement)?.classList.contains("meal-plan-recipe-list");
		const del = (event.target as HTMLElement)?.closest(".multi-select-pill-remove-button");
		const sel = (event.target as HTMLElement)?.closest(".multi-select-pill-content");
		if (del) return this.handleMealPlanDel(event);
		if (sel) return this.handleMealPlanSel(event);
		if (add) return this.handleMealPlanAdd(event);
	}


	/**
	 *
	 **/
	async handleMealPlanDel(event:MouseEvent) {
		const row = (event.target as HTMLElement).closest("tr");
		const timestamp = row?.dataset.timestamp;
		const name = ((event.target as HTMLElement)?.closest("[data-name]") as HTMLElement)?.dataset.name;

		if (!timestamp || !name) return;
		
		this.recipelog.del(timestamp, name);
		this.renderMealPlan();
		this.recipelog.write(this.logpath);
	}


	/**
	 *
	 **/
	async handleMealPlanSel(event : MouseEvent) {
		const name = ((event.target as HTMLElement)?.closest("[data-name]") as HTMLElement)?.dataset.name;
		const file = this.app.vault.getAbstractFileByPath(`${this.recipepath}/${name}.md`) as TFile;
		if (file) this.app.workspace.getLeaf("tab").openFile(file);
	}


	/**
	 *
	 **/
	async handleMealPlanAdd(event : MouseEvent) {

		// Get the row we clicked on
		const row = (event.target as HTMLElement).closest("tr");
		if (!row) return;
	
		// ???
		if (!row.dataset.timestamp) return;
		const timestamp = row.dataset.timestamp;
		new SelectRecipeModal(this, this.recipepath, this.logpath, timestamp).open();
	}


	// Do the render and assign to the element.
	async renderMealPlan() {
		this.container.innerHTML = this.eta.render("@mealPlan", {
			start: DateTime.now().minus({'days': 2}),
			end:   DateTime.now().plus({'days': 10}),
			log: this.recipelog
		});
	}


	/**
	 *
	 **/
	async processMarkdown() {

		await this.recipelog.read(this.logpath);
		await this.renderMealPlan();

		// ???
		this.container.addEventListener("click",    this.handleMealPlanClick.bind(this));
	}
};
