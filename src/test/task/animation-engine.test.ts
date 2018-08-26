import {
    IAnimationFlowPart,
    SingleAnimationEngine,
} from '../../task/animation-engine';
import { ITaskFlow } from '../../task/flow/task-flow';
import { ITest } from '../ITest';

export class AnimationEngineTests implements ITest {

    //#region Public

    public performTests(): void {
        describe('Animation Engine Tests', () => {
            this.itMustBeInitializable();
            this.itMustBeAbleToPerformASimpleAnimation();
        });
    }

    //#endregion

    //#region Protected

    protected generateDivElement(): HTMLElement {
        const r = Math.ceil(Math.random() * 256);
        const g = Math.ceil(Math.random() * 256);
        const b = Math.ceil(Math.random() * 256);
        const element: HTMLElement = document.createElement('div');
        element.style.backgroundColor = 'rgb(' + r.toString() + ', ' + g.toString() + ', ' + b.toString() + ')';
        const height: number = 100;
        element.style.height = height + 'px';
        return element;
    }

    //#endregion

    private itMustBeInitializable(): void {
        it('mustBeInitializable', () => {
            const animationEngine: SingleAnimationEngine = new SingleAnimationEngine();
            expect(animationEngine).not.toBeNull();
        });
    }

    private itMustBeAbleToPerformASimpleAnimation() {
        it('mustBeAbleToPerformASimpleAnimation', () => {
            const element = this.generateDivElement();
            const animationEngine: SingleAnimationEngine = new SingleAnimationEngine();
            const taskFlow: ITaskFlow<IAnimationFlowPart> = {
                getPartByAlias: function(alias: string): IAnimationFlowPart {
                    if ('elem' === alias) {
                        return taskFlow.parts[0];
                    } else {
                        return null;
                    }
                },
                parts: [
                    {
                        alias: 'elem',
                        elements: [ element ],
                        styles: [ 'sora-fade-out-animation' ],
                        when: null,
                    },
                ],
            };

            const promises: Array<Promise<void>> = animationEngine.handle(taskFlow);
        });
    }
}
