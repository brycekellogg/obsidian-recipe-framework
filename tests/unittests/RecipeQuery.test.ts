import RecipeQuery from 'utils/RecipeQuery';
import Recipe      from 'utils/Recipe';

jest.mock('obsidian', () => {}, {virtual: true});

test("empty data", async () => {
    const recipeMap: Map<string, Recipe> = new Map<string, Recipe>();
    
    const q: RecipeQuery = RecipeQuery.new(recipeMap);

    expect(q.length).toBe(0);
});


test("iterator", async () => {
    const recipeMap: Map<string, Recipe> = new Map<string, Recipe>([
        ['one',   new Recipe('one')],
        ['two',   new Recipe('two')],
        ['three', new Recipe('three')],
    ]);
    
    const q: RecipeQuery = RecipeQuery.new(recipeMap);

    expect(q.length).toBe(3);
    for (const recipe of q) {
        console.log(recipe);
    }
});
