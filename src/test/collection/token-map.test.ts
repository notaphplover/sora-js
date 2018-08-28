
import { TokenMap } from '../../collection/token-map';
import { ITest } from '../ITest';

export class TokenMapTests implements ITest {

    public performTests(): void {
        describe('Token Map Tests', () => {
            this.itMustBeInitializable();
            this.itMustBeAbleToAddElements();
            this.itMustBeAbleToAddAndRemoveElements();
            this.itMustBeAbleToReuseUnusedIndexes();
        });
    }

    private itMustBeInitializable(): void {
        it('mustBeInitializable', () => {
            const map = new TokenMap();
            expect(map).not.toBe(null);
            expect(map.count()).toBe(0);
        });
    }

    private itMustBeAbleToAddElements(): void {
        it('mustBeAbleToAddElements', () => {
            const map = new TokenMap<{}>();
            const elementsToAdd = 64;

            for (var i = 0; i < elementsToAdd; ++i) {
                expect(map.add(i)).toBe(i);
            }

            for (var i = 0; i < elementsToAdd; ++i) {
                expect(map.get(i)).toBe(i);
            }

            expect(map.count()).toBe(elementsToAdd);
        });
    }

    private itMustBeAbleToAddAndRemoveElements(): void {
        it('mustBeAbleToAddAndRemoveElements', () => {
            const map = new TokenMap<{}>();
            const elementsToAdd = 64;
            const elementsToRemove = 32;
            for (var i = 0; i < elementsToAdd; ++i) {
                expect(map.add(i)).toBe(i);
            }

            for (var i = 0; i < elementsToAdd; ++i) {
                expect(map.get(i)).toBe(i);
            }

            for (var i = 0; i < elementsToRemove; ++i) {
                expect(map.remove(i)).toBe(true);
            }

            expect(map.count()).toBe(elementsToAdd - elementsToRemove);
        });
    }

    private itMustBeAbleToReuseUnusedIndexes(): void {
        it('mustBeAbleToReuseUnusedIndexes', () => {
            const map = new TokenMap<{}>();
            const elementsToAdd = 64;
            const elementsToRemove = 32;
            for (var i = 0; i < elementsToAdd; ++i) {
                expect(map.add(i)).toBe(i);
            }

            for (var i = 0; i < elementsToAdd; ++i) {
                expect(map.get(i)).toBe(i);
            }

            for (var i = 0; i < elementsToRemove; ++i) {
                expect(map.remove(i)).toBe(true);
            }

            for (var i = 0; i < elementsToRemove; ++i) {
                expect(map.add(i)).toBeLessThan(elementsToRemove);
            }

            expect(map.count()).toBe(elementsToAdd);
        });
    }
}
