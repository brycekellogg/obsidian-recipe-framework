const query = `

/* We use "Common Table Expressions" (CTE) via the "WITH" keywork to save
 * temporary subqueries that can be used in subsequent "FROM" clauses. This
 * is done to increase the readability of the query as a whole.
 * 
 * More information: https://www.sqlite.org/lang_with.html
 */
WITH

/* A subquery that combines the Recipes, Cooks, Genres, & Equip tables.
 *
 * The resulting table contains multiple duplicate rows for each recipe
 * because of how we join with the Cooks, Genres, & Equip tables. Specifically,
 * each recipe will have a row for every combination of the cookdate, genre,
 * & equip fields. While this may blow up in size quickly, I expect it to
 * not be a significant issue with the database sizes I'm dealing with.
 */
RecipesJoined AS (
    SELECT
        Recipes.filepath   AS filepath,
        Recipes.name       AS name,
        Recipes.locale     AS locale,
        Recipes.makes      AS makes,
        Recipes.preptime   AS preptime,
        Recipes.cooktime   AS cooktime,
        Recipes.vegan      AS vegan,
        Recipes.vegetarian AS vegetarian,
        Recipes.glutenfree AS glutenfree,
        Cooks.cookdate     AS cookdate,
        Genres.genre       AS genre,
        Equip.equip        AS equip
    FROM Recipes
    LEFT JOIN Cooks  ON Recipes.filepath = Cooks.recipe
    LEFT JOIN Genres ON Recipes.filepath = Genres.recipe
    LEFT JOIN Equip  ON Recipes.filepath = Equip.recipe
),

/*  A subquery that aggregates recipes such that each recipe is a single row.
 *
 * 
 * We can group by name, path, makes, etc because they
 *            * should all be the same because they came from Recipes table
 * 
 */
RecipesGrouped AS (
    SELECT
        filepath,
        name,
        locale,
        makes,
        preptime,
        cooktime,
        vegan,
        vegetarian,
        glutenfree,
        json_group_array(DISTINCT cookdate) filter (where cookdate IS NOT null) AS cookdates,
        json_group_array(DISTINCT genre)    filter (where genre    IS NOT null) AS genres,
        json_group_array(DISTINCT equip)    filter (where equip    IS NOT null) AS equip
    FROM RecipesJoined
    GROUP BY filepath, name, locale, makes, preptime, cooktime, vegan, vegetarian, glutenfree
),

/* ???
 */ 
RecipesFiltered AS (
    SELECT
        DISTINCT filepath
    FROM RecipesJoined
    WHERE {where}
)


/* The actual query run.
 */
SELECT
    *
FROM RecipesGrouped
WHERE filepath in RecipesFiltered;
`
export default query;
