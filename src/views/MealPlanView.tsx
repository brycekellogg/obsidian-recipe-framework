
import {
    DateTime,
    Interval,
} from 'luxon';

import {
    useState,
    KeyboardEvent,
    FormEvent,
    MouseEvent,
    useReducer,
} from 'react';

import { Close } from '@mui/icons-material';

import { createPortal } from 'react-dom';

import {
    Database
} from 'utils/Database';


import Fuse from 'fuse.js';


// ???
enum View {
    WEEK,
    MONTH,
}




export default function MealPlan() {
    const [recipeSelectEnable, setRecipeSelectEnable] = useState(false);
    const [recipeSelectDate,   setRecipeSelectDate]   = useState("");
    const [view, setView] = useState<View>(View.WEEK);
    const [start, setStart] = useState<string>(DateTime.now().toISODate())

    const [, refresh] = useReducer(_ => _+1,0)
    Database.onChange(() => refresh());

    //
    const onAdd = (date: string) => {
        setRecipeSelectDate(date);
        setRecipeSelectEnable(true);
    };

    // ????
    //
    //
    const onAddDone = (path: string) => {
        setRecipeSelectEnable(false);
        const recipe = Database.recipes.filter({filepath: path}).get();
        if (!recipe?.cookdates?.includes(recipeSelectDate)) {
            recipe?.cookdates?.push(recipeSelectDate);
        }
        Database.save(recipe);
    }

    // ???
    //
    //
    const onAddCancel = () => {
        setRecipeSelectEnable(false);
    }


    //
    // createPortal attaches the dialog box to the document.body allowing it to be a modal full screen kind f thing
    return <div>
        {view == View.WEEK  && <WeekView onAdd={onAdd} start={start}/>}
        {view == View.MONTH && <></>}
        {recipeSelectEnable && createPortal(<SelectRecipeDialog onDone={onAddDone} onCancel={onAddCancel}/>, document.body)}
    </div>;
}


/*
 *
 */
function WeekView(
    props : {
        start: string,
        onAdd: (date: string )=> void,
    }
) {

    const dateStart = DateTime.fromISO(props.start);
    const dateEnd   = dateStart.plus({'weeks': 1});
    const data = Interval
        .fromDateTimes(dateStart, dateEnd)
        .splitBy({days: 1})
        .map(d => {
            return {
                dateText: (d.start as DateTime).toFormat('MMM d - EEE'),
                dateISO:  (d.start as DateTime).toISODate(),
            };
        }) as {
            dateText: string,
            dateISO:  string,
        }[];

    // add a span that contains nothing that is the "new recipe" space to click on
    //
    return (
        <table>
            <tbody>{
                data.map(row => (
                    <tr key={row.dateISO}>
                        <td>{row.dateText}</td>
                        <td><RecipeList date={row.dateISO} /></td>
                    </tr>
                ))
            }</tbody>
        </table>
    );
}


/*
 *
 */
function RecipeList(
    props : {
        date: string,
    })
{
    const date = props.date;
    const recipes = Database.recipes.filter({cookdate: date}).all();
    
    // ???
    //
    // delete the date from the list
    const onDelete = (recipe, date: string) => {
        recipe.cookdates = recipe.cookdates.filter((item: string) => item != date);
        Database.save(recipe);
    }

    // ???
    return (
        <div>{
            recipes.map(recipe => (
                <span key={recipe.filepath} data-path={recipe.filepath} data-date={date}>
                    <a data-href={recipe.filepath} href={recipe.filepath} className="internal-link">{recipe.name}</a>
                    <span onClick={() => onDelete(recipe, date)}>
                        <Close />
                    </span>
                </span>
            ))
        }<span>test</span></div>
    );
}


/*
 *
 */ 
function SelectRecipeDialog(
    props : {
        onDone:   (path: string) => void,
        onCancel: () => void,
    }
) {

    // ???
    const fuse = new Fuse(Database.recipes.all(), {
        keys: ['name'],
        useExtendedSearch: true,
    });

    // ???
    const [index,   setIndex]   = useState(0);
    const [recipes, setRecipes] = useState(fuse.search("!123456789"));

    // A callback function for handling an input event.
    //
    // This callback is used to handle text key presses in the input text
    // box. When a new character is typed (or deleted), this will update the
    // search terms and repopulate/sort the list of recipe results.
    //
    // TODO: why are we using the weird fuse search term?
    //
    // Note: this funciton only gets called when the contents of the text input
    //       field change, which should encompass all text based key presses
    //       for the entire time the dialog is visible.
    const onInput = (event: FormEvent) => {
        const value = (event.target as HTMLInputElement).value;
        setRecipes(fuse.search(value || "!123456789"));
    };

    // A callback function for handling a keydown event.
    //
    // This callback is required to handle non-text key presses, specifically
    // "ArrowUp", "ArrowDown", "Enter" and "Escape". These key presses are not
    // handled by the onInput change and so need a separate handler.
    //
    // This is used to control changing selection, cancellation, and selection.
    // Specifically, the following KeyboardEvents are handled:
    //    - "ArrowUp" = select the previous (upwards) row
    //    - "ArrowDown" = select the next (downwards) row
    //    - "Enter" = submit the dialog with the selected row
    //    - "Escape" = cancel the dialog
    //
    // Note: this function only gets called when the text input field has
    //       focus, which should be the entire time the dialog is visible.
    const onKeydown = (event: KeyboardEvent) => {
        const min = 0;
        const max = recipes.length-1;
        const path = recipes[index].item.filepath;
        switch (event.key) {
            case 'ArrowUp':   (index > min) && setIndex(index-1); break;
            case 'ArrowDown': (index < max) && setIndex(index+1); break;
            case 'Enter':  props.onDone(path);                 break;
            case 'Escape': props.onCancel();                   break;
        }
    };

    //
    const onClick = (event: MouseEvent) => {
        const target = (event.target as HTMLElement);
        if (target.dataset['path']) {
            props.onDone(target.dataset['path'])
        } else {
            props.onCancel();
        }
    };

    // We use the unary '+' operator to convert the index from a string to a
    // number.
    const onMouseMove = (event: MouseEvent) => {
        const target = (event.target as HTMLElement);
        if (target.dataset['index']) setIndex(+target.dataset['index'])
    }

    // "autoFocus" is used to make the input have focus on render. This we can immediately
    // start typing (or hit escape) without needing to click on the "input" box
    return (
        <div className='recipe-select' onKeyDown={onKeydown} onClick={onClick}>
            <div className="recipe-select-contents">
                <input autoFocus type='text' onInput={onInput}></input>
                <div className="recipe-select-list">
                    <ul>
                        {recipes.map((recipe, i) => (
                            <li key={recipe.item.filepath}
                                className={i == index ? "selected" : ""}
                                data-path={recipe.item.filepath}
                                data-index={i}
                                onMouseMove={onMouseMove}>
                                {recipe.item.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
