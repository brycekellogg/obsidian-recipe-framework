import Database    from 'utils/Database';
import FileManager from 'utils/FileManager';

import {
    DateTime,
} from 'luxon';

// Configure mocks
jest.mock('utils/FileManager');
const MockFileManager = jest.mocked(FileManager);


beforeEach(() => {
    MockFileManager.findFiles.mockClear();
    MockFileManager.modified.mockClear();
    MockFileManager.read.mockClear();
    MockFileManager.write.mockClear();
})


test("load recipes no files", async () => {
    const d: Database = new Database('', '');

    MockFileManager.findFiles.mockReturnValueOnce([]);

    await d.loadRecipes();

    expect(MockFileManager.findFiles).toHaveBeenCalledTimes(1);
    expect(MockFileManager.modified).not.toHaveBeenCalled();
    expect(MockFileManager.read).not.toHaveBeenCalled();
})


test("load recipes with files", async () => {
    const d: Database = new Database('', '');

    MockFileManager.findFiles.mockReturnValueOnce(["recipe1.md", "recipe2.md"]);
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
                            .mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"));

    await d.loadRecipes();

    expect(MockFileManager.findFiles).toHaveBeenCalledTimes(1);
    expect(MockFileManager.modified).toHaveBeenCalledTimes(2);
    expect(MockFileManager.read).toHaveBeenCalledTimes(2);
})


test("load cooks empty file", async () => {
    const d: Database = new Database('', '');

    MockFileManager.read.mockResolvedValueOnce('');

    await d.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(d.cookCount()).toBe(0);
})


test("load cooks incorrect schema 1", async () => {
    const d: Database = new Database('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        something
    `)

    await d.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(d.cookCount()).toBe(0);
})


test("load cooks incorrect schema 2", async () => {
    const d: Database = new Database('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        - one
        - two
    `)

    await d.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(d.cookCount()).toBe(0);
})


test("load cooks incorrect schema 3", async () => {
    const d: Database = new Database('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        key: value
    `)

    await d.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(d.cookCount()).toBe(0);
})


test("load cooks incorrect schema 4", async () => {
    const d: Database = new Database('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        2024-06-29[meal=dinner]: value
    `)

    await d.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(d.cookCount()).toBe(0);
})


test("load cooks incorrect schema 5", async () => {
    const d: Database = new Database('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        2024-06-29[meal=dinner]: {key: value}
    `)

    await d.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(d.cookCount()).toBe(0);
})


test("load cooks incorrect schema 6", async () => {
    const d: Database = new Database('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        2024-06-29[meal=dinner]: 
            - something
            - else
    `)

    await d.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(d.cookCount()).toBe(0);
})


test("load cooks incorrect schema 7", async () => {
    const d: Database = new Database('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        2024-06-29[nope=dinner]: 
            - something
            - else
    `)

    await d.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(d.cookCount()).toBe(0);
})


test("load cooks correct schema", async () => {
    const d: Database = new Database('', '');

    MockFileManager.read.mockResolvedValueOnce(`
        2024-06-29[meal=dinner]: 
            - parent/child0.md
            - parent/child1.md
    `)

    await d.loadCooks();

    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(d.cookCount()).toBe(1);
    expect(d.cookGetByID('test')).toBe(undefined);
    expect(d.cookGetByID('2024-06-29[meal=dinner]')?.length).toBe(2);
    expect(d.cookGetByID('2024-06-29[meal=dinner]')?.at(0)).toBe('parent/child0.md');
    expect(d.cookGetByID('2024-06-29[meal=dinner]')?.at(1)).toBe('parent/child1.md');
})


test("adding & dropping cooks", async () => {
    const d: Database = new Database('', '');

    expect(d.cookCount()).toBe(0);

    d.cookAdd('2024-06-29[meal=lunch]', 'parent/child0.md');
    d.cookAdd('2024-06-29[meal=lunch]', 'parent/child1.md');
    d.cookAdd('2024-06-29[meal=dinner]', 'parent/child0.md');
    d.cookAdd('2024-06-29[meal=dinner]', 'parent/child2.md');
    d.cookAdd('2024-06-29[meal=dinner]', 'parent/child3.md');

    expect(d.cookCount()).toBe(2);
    expect(d.cookGetByID('2024-06-29[meal=lunch]')?.length).toBe(2);
    expect(d.cookGetByID('2024-06-29[meal=dinner]')?.length).toBe(3);
    expect(d.cookGetByID('2024-06-29[meal=lunch]')?.at(0)).toBe('parent/child0.md');
    expect(d.cookGetByID('2024-06-29[meal=lunch]')?.at(1)).toBe('parent/child1.md');
    expect(d.cookGetByID('2024-06-29[meal=dinner]')?.at(0)).toBe('parent/child0.md');
    expect(d.cookGetByID('2024-06-29[meal=dinner]')?.at(1)).toBe('parent/child2.md');
    expect(d.cookGetByID('2024-06-29[meal=dinner]')?.at(2)).toBe('parent/child3.md');

    d.cookDrop('2024-06-29[meal=lunch]', 'parent/child0.md');
    d.cookDrop('2024-06-29[meal=lunch]', 'parent/child1.md');
    d.cookDrop('2024-06-29[meal=lunch]', 'parent/nope.md');  // doesn't exist
    d.cookDrop('2024-06-29[meal=dinner]', 'parent/child2.md');

    expect(d.cookCount()).toBe(1);
    expect(d.cookGetByID('2024-06-29[meal=dinner]')?.length).toBe(2);
    expect(d.cookGetByID('2024-06-29[meal=dinner]')?.at(0)).toBe('parent/child0.md');
    expect(d.cookGetByID('2024-06-29[meal=dinner]')?.at(1)).toBe('parent/child3.md');
});


test("rename recipe", async () => {
    const d: Database = new Database('', '');

    d.cookAdd('2024-06-29[meal=lunch]', 'parent/child0.md');
    d.cookAdd('2024-06-29[meal=lunch]', 'parent/child1.md');
    d.cookAdd('2024-06-29[meal=dinner]', 'parent/child0.md');
    d.cookAdd('2024-06-29[meal=dinner]', 'parent/child2.md');
    d.cookAdd('2024-06-29[meal=dinner]', 'parent/child3.md');

    d.renameRecipe("parent/child0.md", "parent/child6.md");

    expect(d.cookCount()).toBe(2);
    expect(d.cookGetByID('2024-06-29[meal=lunch]')?.length).toBe(2);
    expect(d.cookGetByID('2024-06-29[meal=dinner]')?.length).toBe(3);
    expect(d.cookGetByID('2024-06-29[meal=lunch]')?.at(0)).toBe('parent/child6.md');
    expect(d.cookGetByID('2024-06-29[meal=lunch]')?.at(1)).toBe('parent/child1.md');
    expect(d.cookGetByID('2024-06-29[meal=dinner]')?.at(0)).toBe('parent/child6.md');
    expect(d.cookGetByID('2024-06-29[meal=dinner]')?.at(1)).toBe('parent/child2.md');
    expect(d.cookGetByID('2024-06-29[meal=dinner]')?.at(2)).toBe('parent/child3.md');
});


test("writing cooks", async () => {
    const d: Database = new Database('', 'Food/Logs/Cooks.yaml');
    d.cookAdd('2024-06-29[meal=lunch]', 'parent/child0.md');
    d.cookAdd('2024-06-29[meal=lunch]', 'parent/child1.md');
    d.cookAdd('2023-06-26[meal=dinner]', 'parent/child0.md');
    d.cookAdd('2023-06-26[meal=dinner]', 'parent/child2.md');
    d.cookAdd('2023-06-26[meal=dinner]', 'parent/child3.md');

    await d.writeCooks();

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
    const d: Database = new Database('', '');

    expect(d.cooks.length).toBe(0);

    d.cookAdd('2024-06-29[meal=lunch]', 'parent/child0.md');
    d.cookAdd('2024-06-29[meal=lunch]', 'parent/child1.md');
    d.cookAdd('2024-06-29[meal=dinner]', 'parent/child0.md');
    d.cookAdd('2024-06-29[meal=dinner]', 'parent/child2.md');
    d.cookAdd('2024-06-29[meal=dinner]', 'parent/child3.md');

    expect(d.cooks.length).toBe(2);
    expect(d.cooks['2024-06-29[meal=lunch]']?.length).toBe(2);
    expect(d.cooks['2024-06-29[meal=dinner]']?.length).toBe(3);
    expect(d.cooks['2024-06-29[meal=lunch]']?.at(0)).toBe('parent/child0.md');
    expect(d.cooks['2024-06-29[meal=lunch]']?.at(1)).toBe('parent/child1.md');
    expect(d.cooks['2024-06-29[meal=dinner]']?.at(0)).toBe('parent/child0.md');
    expect(d.cooks['2024-06-29[meal=dinner]']?.at(1)).toBe('parent/child2.md');
    expect(d.cooks['2024-06-29[meal=dinner]']?.at(2)).toBe('parent/child3.md');

    d.cooks['2024-06-29[meal=lunch]'].drop('parent/nope.md');  // doesn't exist
    d.cooks['2024-06-29[meal=lunch]'].drop('parent/child0.md');
    d.cooks['2024-06-29[meal=lunch]'].drop('parent/child1.md');
    d.cooks['2024-06-29[meal=dinner]'].drop('parent/child2.md');

    expect(d.cooks.length).toBe(1);
    expect(d.cooks['2024-06-29[meal=dinner]']?.length).toBe(2);
    expect(d.cooks['2024-06-29[meal=dinner]']?.at(0)).toBe('parent/child0.md');
    expect(d.cooks['2024-06-29[meal=dinner]']?.at(1)).toBe('parent/child3.md');
})
