// One per file
describe('example test', () => {
    // For each behavior
    it('should do something', () => {
        const a = 42;

        expect(a).toBe(42);
    });

    it('Should do something else', () => {
        const o = {
            foo: 'bar'
        };
        expect (o.foo).toBeDefined();
    });
});
