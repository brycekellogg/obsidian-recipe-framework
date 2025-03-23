/**
 * Author: Bryce Kellogg (bryce@kellogg.org)
 * Copyight: Bryce Kellogg 2024
 * License: GPL-2.0-only
 */

import {
    createRoot
} from 'react-dom/client';

import { Eta } from 'eta';
import Fuse from 'fuse.js';

import * as templates from 'templates';

import { Database } from 'utils/Database';
import { createPortal } from 'react-dom';


/* A popup modal window that allows selecting a recipe from the Database.
 *
 * The modal provides a list of all recipes found in the recipe Database that
 * can be fuzzy searched/filtered in real-time via a text box; the currently
 * selected recipe can be navigated via the mouse or arrow keys; escape or
 * clicking off will close the modal; and Enter or clicking a recipe will
 * selected it. The full recipe path is returned on selection.
 * 
 * The modal HTML elements get added to the document on creation and removed
 * when the modal closes. 
 * 
 * Example:
 *
 *    ```
 *    import SelectRecipeModal from 'utils/SelectRecipeModal'; 
 *    const recipePath: string = await new SelectRecipeModal().show();
 *    ```
 */
export default class SelectRecipeModal {

    //root;
    
    /* Contruct a new SelectRecipeModal.
     *
     * The constructor initializes the modal and adds it to the document
     * in the hidden state. To ctually show the modal and get the result
     * you need to call .show()
     */
    constructor(root) {

        //const container = document.createElement('div');
        //container.className = 'recipe-select';
        //document.body.appendChild(container)
        //this.root = createRoot(container);

        const modal = createPortal(<>
            <div className="recipe-select-contents">
                <input type='text'></input>
                <div className="recipe-select-list">
                    <ul>
                    </ul>
                </div>
            </div>
        </>, document.body);
        root.render(modal);
        //// Initialize template engine & load templates
        //const eta = new Eta();
        //eta.loadTemplate("@modal", templates.SelectRecipeModal);
        //
        //// Create, populate, & attach the modal container.
        //// Note: by default the container has "display: none" so
        ////       it doesn't get rendered at this point.
        //this.container = document.createElement('div');
        //this.container.innerHTML = eta.render('@modal', {recipes: Database.recipes});
        //document.body.appendChild(this.container)
        //
        //// Initialize fuzzy search engine.
        //// Note: we include 'useExtendedSearch so that we can
        ////       match all recipes using !<non-existent-string>.
        //this.fuse = new Fuse(Database.recipes.data, {  // TODO: make this work with only Database.recipes
        //    keys: ['basename'],
        //    useExtendedSearch: true,
        //});
    }
    

    /* Event handler for the 'click' event.
     *
     * This function gets tiggered any time we click on any part of the modal
     * including the transparent "background" off the side of the modal. This
     * this allows us to click to close or click to select.
     * 
     * Params:
     *    resolve = the Promise resolve function that allows us to return values
     *    event   = the event that was triggered
     */
    //onClick(resolve, event: PointerEvent) {
    //    const modal = this.container.querySelector('.recipe-framework-modal');
    //    const li    = this.container.querySelector('li.selected')
    //
    //    // We only care about click a recipe element or clicking off the modal
    //    switch (event.target) {
    //        case modal: resolve(undefined);       this.container.remove(); break;
    //        case li:    resolve(li.dataset.path); this.container.remove(); break;
    //    }
    //}


    /* Event handler for the 'keydown' event.
     * 
     * This function triggers any time we type into the input box on the
     * modal. It is used to select a recipe (up/down), close the modal,
     * or confirm a selection. Actual typing is handled by onInput.
     *
     * Params:
     *    resolve = the Promise resolve function that allows us to return values
     *    event   = the event that was triggered
     */
    //onKeydown(resolve, event: KeyboardEvent) {
    //    const li = this.container.querySelector('li.selected')
    //
    //    switch (event.key) {
    //
    //        // Change selected recipe downwards (no wrapping)
    //        case 'ArrowDown':
    //            if (li.nextElementSibling) {
    //                li.classList.remove("selected");
    //                li.nextElementSibling.classList.add("selected");
    //            }
    //            return;
    //
    //        // Change selected recipe upwards (no wrapping)
    //        case 'ArrowUp':
    //            if (li.previousElementSibling) {
    //                li.classList.remove("selected");
    //                li.previousElementSibling.classList.add("selected");
    //            }
    //            return;
    //
    //        // Return the currently selected recipe & close modal
    //        case 'Enter':
    //            resolve(li.dataset.path);
    //            this.container.remove();
    //            return;
    //
    //        // Close modal without returning a recipe
    //        case 'Escape':
    //            resolve(undefined);
    //            this.container.remove();
    //            return;
    //    }
    //
    //}


    /* Event handler for the 'input' event.
     * 
     * This function gets triggered any time the input text box gets a new
     * character typed into it (as in the `input.value` changes. This means
     * that it ignores things like arrow keys, shift, etc.
     *
     * Params:
     *    event = the event that was triggered
     */
    //onInput(event: InputEvent) {
    //    const input = event.target;
    //    const ul    = this.container.querySelector('ul');
    //    const li    = this.container.querySelector('li.selected')
    //
    //    // Reset selected recipe when we type
    //    li.classList.remove("selected");
    //    ul.firstElementChild.classList.add("selected");
    //
    //    // Perform search/filtering & update displayed list
    //    const results = this.fuse.search(input.value || "!123456789");
    //    for (let i=0; i < ul.children.length; i++) {
    //        ul.children[i].innerHTML     = (i < results.length) ? results[i].item.basename : undefined;
    //        ul.children[i].dataset.path  = (i < results.length) ? results[i].item.path     : undefined;
    //        ul.children[i].style.display = (i < results.length) ? 'list-item' : 'none';
    //    }
    //}


    /* Event handler for the 'mousemove' event.
     * 
     * This function gets triggered any time we move the mouse inside of
     * the 'ul' list element. We use the 'target' property of the event to
     * determine which recipe the mouse is currently hovering over.
     * 
     * Note: we don't need the resolve parameter like the other callbacks
     *       because a 'mousemove' event can't close the modal.
     *
     * Params:
     *    event = the event that was triggered
     */
    //onMousemove(event: PointerEvent) {
    //    const ul = this.container.querySelector('ul');
    //    const li = this.container.querySelector('li.selected');
    //
    //    // Only update if the selected recipe changes
    //    if (li != event.target) {
    //        li.classList.remove("selected");
    //        event.target.classList.add("selected");
    //    }
    //}


    /* Show the recipe select modal and return the selected recipe path.
     *
     * Returns: a Promise that resolves to a string containing the full
     *          Obsidian path to the selected recipe or undefined if nothing
     *          ends up being selected.
     */
    show() : Promise<string> {

        //const modal = this.container.querySelector('.recipe-framework-modal');
        //const input = this.container.querySelector('input');
        //const ul    = this.container.querySelector('ul');
        //
        //// Make the modal visibale and give the input text box focus so we
        //// can immediately start typing. Note that the focus needs to happen
        //// after we make the modal visible.
        //modal.style.display = 'flex';
        //input.focus();
        //
        //// Always start with the first element selected
        //ul.firstElementChild.classList.add("selected");
        //
        //// Doesn't need to be in the promise because they can't close the modal
        //ul.addEventListener('mousemove', this.onMousemove.bind(this));
        //input.addEventListener('input',  this.onInput.bind(this));
        //
        //// The promise allows us to return a value from the
        //// event handlers that can cause the modal to close.
        //return new Promise((resolve) => {
        //    modal.addEventListener('click',   this.onClick.bind(this, resolve));
        //    modal.addEventListener('keydown', this.onKeydown.bind(this, resolve));
        //});
    }
}
