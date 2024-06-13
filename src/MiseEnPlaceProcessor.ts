
import { Eta } from 'eta';

import * as templates from './templates';

enum state {
	TOP,
	INGREDIENTS,
	DIRECTIONS,
	OTHER,
}

export default class MiseEnPlaceProcessor {
	
    constructor(plugin: RecipeFramework) {
        this.recipepath = plugin.settings.RecipePath;
		this.state = state.TOP;

        this.eta = new Eta();
        this.eta.loadTemplate("@MiseEnPlace", templates.Brackets);
	}

	async postProcess(element, context) {
		
		// We only process notes under the configured recipe path
		if (!context.sourcePath.startsWith(this.recipepath)) return;

		// If the name is set, we are in a section to process
		if (this.name) {
			const ingredientList = element.querySelector('ul').outerHTML;
			element.innerHTML = this.eta.render('@MiseEnPlace', {name: this.name, list: ingredientList}); 
		}
		
		// Update the name so that we can know if we're in the right section
		const sectionHeading = element.querySelector('[data-heading^="("][data-heading$=")"]');
		this.name = sectionHeading?.dataset?.heading;
		sectionHeading?.remove();
	}
}
