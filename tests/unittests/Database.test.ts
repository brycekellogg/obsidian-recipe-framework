import Database    from 'utils/Database';
import FileManager from 'utils/FileManager';

import {
    DateTime,
} from 'luxon';

// Configure mocks
jest.mock('utils/FileManager');
jest.mock('obsidian', () => {}, {virtual: true});
const MockFileManager = jest.mocked(FileManager);


beforeEach(() => {
    MockFileManager.findFiles.mockClear();
    MockFileManager.modified.mockClear();
    MockFileManager.read.mockClear();
    MockFileManager.write.mockClear();
})


test("load recipes no files", async () => {
    Database.init('', '');

    MockFileManager.findFiles.mockReturnValueOnce([]);

    await Database.loadRecipes();

    expect(MockFileManager.findFiles).toHaveBeenCalledTimes(1);
    expect(MockFileManager.modified).not.toHaveBeenCalled();
    expect(MockFileManager.read).not.toHaveBeenCalled();
})


test("load recipes with files", async () => {
    Database.init('', '');

    MockFileManager.findFiles.mockReturnValueOnce(["recipe1.md", "recipe2.md"]);
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
                            .mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"));

    await Database.loadRecipes();

    expect(MockFileManager.findFiles).toHaveBeenCalledTimes(1);
    expect(MockFileManager.modified).toHaveBeenCalledTimes(2);
    expect(MockFileManager.read).toHaveBeenCalledTimes(2);
})


test("load cooks empty file", async () => {
    Database.init('', '');

    MockFileManager.read.mockResolvedValueOnce('');

    await Database.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(Database.cookCount()).toBe(0);
})


test("load cooks incorrect schema 1", async () => {
    Database.init('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        something
    `)

    await Database.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(Database.cookCount()).toBe(0);
})


test("load cooks incorrect schema 2", async () => {
    Database.init('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        - one
        - two
    `)

    await Database.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(Database.cookCount()).toBe(0);
})


test("load cooks incorrect schema 3", async () => {
    Database.init('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        key: value
    `)

    await Database.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(Database.cookCount()).toBe(0);
})


test("load cooks incorrect schema 4", async () => {
    Database.init('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        2024-06-29[meal=dinner]: value
    `)

    await Database.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(Database.cookCount()).toBe(0);
})


test("load cooks incorrect schema 5", async () => {
    Database.init('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        2024-06-29[meal=dinner]: {key: value}
    `)

    await Database.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(Database.cookCount()).toBe(0);
})


test("load cooks incorrect schema 6", async () => {
    Database.init('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        2024-06-29[meal=dinner]: 
            - something
            - else
    `)

    await Database.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(Database.cookCount()).toBe(0);
})


test("load cooks incorrect schema 7", async () => {
    Database.init('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        2024-06-29[nope=dinner]: 
            - something
            - else
    `)

    await Database.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(Database.cookCount()).toBe(0);
})


test("load cooks correct schema", async () => {
    Database.init('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        2024-06-29:
            - parent/child0.md
            - parent/child1.md
    `)

    await Database.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(Database.cookCount()).toBe(1);
    expect(Database.cookGetByID('test')).toBe(undefined);
    expect(Database.cookGetByID('2024-06-29')?.length).toBe(2);
    expect(Database.cookGetByID('2024-06-29')?.at(0)).toBe('parent/child0.md');
    expect(Database.cookGetByID('2024-06-29')?.at(1)).toBe('parent/child1.md');
})


test("adding & dropping cooks", async () => {
    Database.init('', '');

    expect(Database.cookCount()).toBe(0);

    Database.cookAdd('2024-06-29[meal=lunch]', 'parent/child0.md');
    Database.cookAdd('2024-06-29[meal=lunch]', 'parent/child1.md');
    Database.cookAdd('2024-06-29[meal=dinner]', 'parent/child0.md');
    Database.cookAdd('2024-06-29[meal=dinner]', 'parent/child2.md');
    Database.cookAdd('2024-06-29[meal=dinner]', 'parent/child3.md');

    expect(Database.cookCount()).toBe(2);
    expect(Database.cookGetByID('2024-06-29[meal=lunch]')?.length).toBe(2);
    expect(Database.cookGetByID('2024-06-29[meal=dinner]')?.length).toBe(3);
    expect(Database.cookGetByID('2024-06-29[meal=lunch]')?.at(0)).toBe('parent/child0.md');
    expect(Database.cookGetByID('2024-06-29[meal=lunch]')?.at(1)).toBe('parent/child1.md');
    expect(Database.cookGetByID('2024-06-29[meal=dinner]')?.at(0)).toBe('parent/child0.md');
    expect(Database.cookGetByID('2024-06-29[meal=dinner]')?.at(1)).toBe('parent/child2.md');
    expect(Database.cookGetByID('2024-06-29[meal=dinner]')?.at(2)).toBe('parent/child3.md');

    Database.cookDrop('2024-06-29[meal=lunch]', 'parent/child0.md');
    Database.cookDrop('2024-06-29[meal=lunch]', 'parent/child1.md');
    Database.cookDrop('2024-06-29[meal=lunch]', 'parent/nope.md');  // doesn't exist
    Database.cookDrop('2024-06-29[meal=dinner]', 'parent/child2.md');

    expect(Database.cookCount()).toBe(1);
    expect(Database.cookGetByID('2024-06-29[meal=dinner]')?.length).toBe(2);
    expect(Database.cookGetByID('2024-06-29[meal=dinner]')?.at(0)).toBe('parent/child0.md');
    expect(Database.cookGetByID('2024-06-29[meal=dinner]')?.at(1)).toBe('parent/child3.md');
});


test("rename recipe", async () => {
    Database.init('', '');

    Database.cookAdd('2024-06-29[meal=lunch]', 'parent/child0.md');
    Database.cookAdd('2024-06-29[meal=lunch]', 'parent/child1.md');
    Database.cookAdd('2024-06-29[meal=dinner]', 'parent/child0.md');
    Database.cookAdd('2024-06-29[meal=dinner]', 'parent/child2.md');
    Database.cookAdd('2024-06-29[meal=dinner]', 'parent/child3.md');

    Database.renameRecipe("parent/child0.md", "parent/child6.md");

    expect(Database.cookCount()).toBe(2);
    expect(Database.cookGetByID('2024-06-29[meal=lunch]')?.length).toBe(2);
    expect(Database.cookGetByID('2024-06-29[meal=dinner]')?.length).toBe(3);
    expect(Database.cookGetByID('2024-06-29[meal=lunch]')?.at(0)).toBe('parent/child6.md');
    expect(Database.cookGetByID('2024-06-29[meal=lunch]')?.at(1)).toBe('parent/child1.md');
    expect(Database.cookGetByID('2024-06-29[meal=dinner]')?.at(0)).toBe('parent/child6.md');
    expect(Database.cookGetByID('2024-06-29[meal=dinner]')?.at(1)).toBe('parent/child2.md');
    expect(Database.cookGetByID('2024-06-29[meal=dinner]')?.at(2)).toBe('parent/child3.md');

    // TODO: check recipes to make sure it's renamed in the recipeMap
});


test("writing cooks", async () => {
    Database.init('', 'Food/Logs/Cooks.yaml');
    Database.cookAdd('2024-06-29[meal=lunch]', 'parent/child0.md');
    Database.cookAdd('2024-06-29[meal=lunch]', 'parent/child1.md');
    Database.cookAdd('2023-06-26[meal=dinner]', 'parent/child0.md');
    Database.cookAdd('2023-06-26[meal=dinner]', 'parent/child2.md');
    Database.cookAdd('2023-06-26[meal=dinner]', 'parent/child3.md');

    await Database.writeCooks();

    expect(MockFileManager.write).toHaveBeenCalledWith('Food/Logs/Cooks.yaml',
`2023-06-26[meal=dinner]:
  - parent/child0.md
  - parent/child2.md
  - parent/child3.md
2024-06-29[meal=lunch]:
  - parent/child0.md
  - parent/child1.md
`);
});


test("cooks proxy", async () => {
    Database.init('', '');

    expect(Database.cooks.length).toBe(0);

    Database.cooks['2024-06-29[meal=lunch]'].add('parent/child0.md');
    Database.cooks['2024-06-29[meal=lunch]'].add('parent/child1.md');
    Database.cooks['2024-06-29[meal=dinner]'].add('parent/child0.md');
    Database.cooks['2024-06-29[meal=dinner]'].add('parent/child2.md');
    Database.cooks['2024-06-29[meal=dinner]'].add('parent/child3.md');

    expect(Database.cooks.length).toBe(2);
    expect(Database.cooks['2024-06-29[meal=lunch]']?.length).toBe(2);
    expect(Database.cooks['2024-06-29[meal=dinner]']?.length).toBe(3);
    expect(Database.cooks['2024-06-29[meal=lunch]']?.at(0)).toBe('parent/child0.md');
    expect(Database.cooks['2024-06-29[meal=lunch]']?.at(1)).toBe('parent/child1.md');
    expect(Database.cooks['2024-06-29[meal=dinner]']?.at(0)).toBe('parent/child0.md');
    expect(Database.cooks['2024-06-29[meal=dinner]']?.at(1)).toBe('parent/child2.md');
    expect(Database.cooks['2024-06-29[meal=dinner]']?.at(2)).toBe('parent/child3.md');

    Database.cooks['2024-06-29[meal=lunch]'].drop('parent/nope.md');  // doesn't exist
    Database.cooks['2024-06-29[meal=lunch]'].drop('parent/child0.md');
    Database.cooks['2024-06-29[meal=lunch]'].drop('parent/child1.md');
    Database.cooks['2024-06-29[meal=dinner]'].drop('parent/child2.md');

    expect(Database.cooks.length).toBe(1);
    expect(Database.cooks['2024-06-29[meal=dinner]']?.length).toBe(2);
    expect(Database.cooks['2024-06-29[meal=dinner]']?.at(0)).toBe('parent/child0.md');
    expect(Database.cooks['2024-06-29[meal=dinner]']?.at(1)).toBe('parent/child3.md');
})
