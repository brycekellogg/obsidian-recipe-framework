import {
    Recipe,
    FileManager,
} from 'utils';

import {
    DateTime,
} from 'luxon';


// Configure mocks
jest.mock('utils/FileManager');
const MockFileManager = jest.mocked(FileManager);


beforeEach(() => {
    MockFileManager.modified.mockClear();
    MockFileManager.read.mockClear();
})


test("empty path", async () => {
    const r: Recipe = await new Recipe("");

    await r.load(); 
    expect(MockFileManager.modified).not.toHaveBeenCalled();
    expect(MockFileManager.read).not.toHaveBeenCalled();
    expect(r.valid).toBe(false);
})


test("non-existent path", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(undefined);
    
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalled();
    expect(MockFileManager.read).not.toHaveBeenCalled();
    expect(r.valid).toBe(false);
})


test("invalid modification time", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");

    MockFileManager.modified.mockReturnValueOnce(DateTime.invalid("test"));

    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalled();
    expect(MockFileManager.read).not.toHaveBeenCalled();
    expect(r.valid).toBe(false);
})


test("loading once with initial modification time", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");

    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"));

    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalled();
    expect(MockFileManager.read).toHaveBeenCalled();
    expect(r.valid).toBe(false);
})


test("loading once with unchanged modification time", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
                            .mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"));
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
    
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(2);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
})


test("loading once with older modification time", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
                            .mockReturnValueOnce(DateTime.fromISO("2024-06-01T09:00:00"));
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
    
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(2);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
})


test("loading twice with newer modification time", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
                            .mockReturnValueOnce(DateTime.fromISO("2024-06-01T11:00:00"));
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
    
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(2);
    expect(MockFileManager.read).toHaveBeenCalledTimes(2);
    expect(r.valid).toBe(false);
})


test("empty file contents", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
    MockFileManager.read.mockResolvedValueOnce("")
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
})


test("no front matter", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
    MockFileManager.read.mockResolvedValueOnce("something something something")
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
})


test("empty front matter", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
    MockFileManager.read.mockResolvedValueOnce(`
        ---
        ---
        something
    `)
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
})


test("yaml as scalar", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
    MockFileManager.read.mockResolvedValueOnce(`
        ---
        nope
        ---
        something
    `)
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
})


test("yaml as array", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
    MockFileManager.read.mockResolvedValueOnce(`
        ---
        - 1
        ---
        something
    `)
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
})


test("yaml incorrect schema 1", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
    MockFileManager.read.mockResolvedValueOnce(`
        ---
        genre: hello
        ---
        something
    `)
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
})


test("yaml incorrect schema 2", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
    MockFileManager.read.mockResolvedValueOnce(`
        ---
        genre: 1
        ---
        something
    `)
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
})


test("yaml incorrect schema 3", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
    MockFileManager.read.mockResolvedValueOnce(`
        ---
        genre: false
        ---
        something
    `)
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
})


test("yaml incorrect schema 4", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
    MockFileManager.read.mockResolvedValueOnce(`
        ---
        genre: {}
        ---
        something
    `)
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
})


test("yaml incorrect schema 5", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
    MockFileManager.read.mockResolvedValueOnce(`
        ---
        locale: 12
        ---
        something
    `)
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
})


test("yaml incorrect schema 6", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
    MockFileManager.read.mockResolvedValueOnce(`
        ---
        locale: []
        ---
        something
    `)
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
})


test("yaml incorrect schema 7", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
    MockFileManager.read.mockResolvedValueOnce(`
        ---
        genre: [1,2,3]
        ---
        something
    `)
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(false);
})

test("complete", async () => {
    const r: Recipe = await new Recipe("/dir/file.md");
    
    MockFileManager.modified.mockReturnValueOnce(DateTime.fromISO("2024-06-01T10:00:00"))
    MockFileManager.read.mockResolvedValueOnce(`
        ---
        genre:
          - beef
          - chicken
          - breakfast
        locale: USA
        serves: 12 people
        
        ---
        something
    `)
                            
    await r.load();
    expect(MockFileManager.modified).toHaveBeenCalledTimes(1);
    expect(MockFileManager.read).toHaveBeenCalledTimes(1);
    expect(r.valid).toBe(true);
    expect(r.locale).toBe("USA");
    expect(r.genre).toEqual(["beef", "chicken", "breakfast"]);
})
