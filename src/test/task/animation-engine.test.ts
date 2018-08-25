import { ITest } from '../ITest';
import { SingleAnimationEngine, IAnimationFlowPart } from '../../task/animation-engine';
import { ITaskFlow } from '../../task/task-engine';

export class AnimationEngineTests implements ITest {

    public constructor() { }

    protected generateDivElement() : HTMLElement {
        var r = Math.ceil(Math.random() * 256);
        var g = Math.ceil(Math.random() * 256);
        var b = Math.ceil(Math.random() * 256);
        var element : HTMLElement = document.createElement('div');
        element.style.backgroundColor = 'rgb(' + r.toString() + ', ' + g.toString() + ', ' + b.toString() + ')';
        const height : number = 100;
        element.style.height = height + 'px';
        return element;
    }

    public performTests() : void {
        describe('Animation Engine Tests', () => {
            this.itMustBeInitializable();
            this.itMustBeAbleToPerformASimpleAnimation();
        });
    }

    private itMustBeInitializable() : void {
        it('mustBeInitializable', () => {
            var animationEngine : SingleAnimationEngine = new SingleAnimationEngine();
            expect(animationEngine).not.toBeNull();
        });
    }

    private itMustBeAbleToPerformASimpleAnimation() {
        it('mustBeAbleToPerformASimpleAnimation', () => {
            var element = this.generateDivElement();
            var animationEngine : SingleAnimationEngine = new SingleAnimationEngine();
            var taskFlow : ITaskFlow<IAnimationFlowPart> = {
                parts: [
                    {
                        alias: 'elem',
                        elements: [ element, ],
                        styles: [ 'sora-fade-out-animation' ],
                        when: null,
                    },
                ],
                getPartByAlias: function(alias : string) : IAnimationFlowPart {
                    if ('elem' == alias)
                        return taskFlow.parts[0];
                    else
                        return null;
                }
            };

            var promises: Promise<void>[] = animationEngine.handle(taskFlow);
        });
    }
}