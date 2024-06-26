import FileManager from 'utils/FileManager';
import Schema      from 'utils/Schema';

import {
    DateTime,
} from 'luxon';

import {
    parse as parseYaml
} from 'yaml';


/*
 *
 */ 
export default class Recipe {


    path: string;
    valid: boolean;
    reason: string;
    basename: string;
    modified: DateTime;

    // Hardcoded properties we read from the recipe frontmatter
    genre: string[];
    locale: string;


    
    
    /**
     *
     *
     *
     */
    constructor(path: string) {
        this.valid = false;
        this.path = path;
        this.basename = path.match(/.*\/(.*)\..*?$/)?.at(1) || "";
        this.modified = DateTime.invalid("uninitialized");    
    }


    /**
     *
     *
     */
    async load() {

        // Check that the path is not empty
        if (!this.path) {
            this.reason = "invalid path";
            return
        }

        // Get the file statistics & check that they are valid.
        // Invalid file stats indicate the file wasn't found.
        const modified: DateTime|undefined = FileManager.modified(this.path);
        if (!modified) {
            this.reason = "file not found";
            return;
        }

        // Check to see when the file was last modified.
        // If it has been modified since we last read it or
        // if we haven't read it before, continue processing.
        if (!modified.isValid || modified <= this.modified) return
        this.modified = modified;
        
        // Read in the file contents & check that they are valid.
        // In this case invlide means empty or undefined.
        const fileContents: string = await FileManager.read(this.path);
        if (!fileContents) {
            this.reason = "empty file";
            return;
        }
      
        // Search for the front matter & make sure it exists
        const frontMatter = fileContents.match(/^\s*---\s*$\n(.*?)^\s*---\s*$/ms)?.at(1);
        if (!frontMatter) {
            this.reason = "invalid frontmatter"
            return;
        }

        // Process frontmatter as YAML & make sure it's valid YAML
        const parsedYaml = parseYaml(frontMatter);
        if (!parsedYaml) {
            this.reason = "invalid frontmatter"
            return;
        }

        // Validate that it conforms to our schema
        const validated = Schema?.getSchema('recipe')?.(parsedYaml);
        if (!validated) {
            this.reason = "invalid frontmatter"
            return;
        }

        // Read in properties
        this.genre = parsedYaml.genre;
        this.locale = parsedYaml.locale;

        // It's only a valid recipe if we make it this far
        this.valid = true;
    }
}


