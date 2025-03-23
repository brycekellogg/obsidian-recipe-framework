import FileManager from 'utils/FileManager';
import Schema      from 'utils/Schema';

import {
    DateTime,
} from 'luxon';

import {
    parse as parseYaml
} from 'yaml';

import {
    RecipeQuery
} from 'utils/Database';

/*
 *
 */ 
export class Recipe {


    valid: boolean;

    // Hardcoded properties we read from the recipe frontmatter

    
    
    /**
     *
     *
     *
     */
    constructor(props: {}) {
        this.valid = false;
        this.filepath = props.filepath;
        this.name     = props.filepath.match(/.*\/(.*)\..*?$/)?.at(1) || "";
        this.genre    = props.genres || null;
        this.locale   = props.locale || null;
        this.cookdates = props.cookdates || null;
    }

    async save() {
    }
}


