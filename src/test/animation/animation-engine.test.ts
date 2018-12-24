import { ITaskFlow } from 'jovellanos/src/task/flow/task-flow';
import { ITaskFlowPartArgs } from 'jovellanos/src/task/flow/task-flow-part-event-args';
import { TaskPartBeginConstraint } from 'jovellanos/src/task/flow/task-part-begin-constraint';
import { TaskPartEndConstraint } from 'jovellanos/src/task/flow/task-part-end-constraint';
import { TaskTimeConstraint } from 'jovellanos/src/task/flow/task-part-time-constraint';
import { IOperationManagerAccess } from 'jovellanos/src/task/operation/operation-manager-access';
import { SingleAnimationEngine } from '../../animation/animation-engine';
import { IAnimationFlowPart } from '../../animation/animation-flow-part';
import { ITest } from '../ITest';

export class AnimationEngineTests implements ITest {

    //#region Public

    public performTests(): void {
        describe('Animation Engine Tests', () => {
            this.itMustBeInitializable();
            this.itMustBeAbleToPerformASimpleAnimation();
            this.itMustBeAbleToPerformMultipleAnimations();
            this.itMustBeAbleToPerformAnimationsWhenAnimationEnds();
            this.itMustBeAbleToPerformAnimationsWhenAnimationStarts();
            this.itMustBeAbleToPerformAnimationAfterMillis();
        });
    }

    //#endregion

    //#region Protected

    protected checkAnimation<
        TArgs extends ITaskFlowPartArgs<TPart>,
        TPart extends IAnimationFlowPart,
    >(
        additionalOperations: (eventArgs: TArgs) => void,
        operationManagerAccess: IOperationManagerAccess<TArgs>,
        part: TPart,
    ): () => boolean {
        var eventRaised: boolean = false;
        const eventHandler = function(eventArgs: TArgs) {
            eventRaised = true;
            eventArgs.part.styles.forEach(function(style: string) {
                expect(part.styles).toContain(style);
            });
            expect(operationManagerAccess.unsubscribe(
                part.alias,
                handlerToken,
            )).toBe(true);
            if (null != additionalOperations) {
                additionalOperations(eventArgs);
            }
        };
        const handlerToken: number =
            operationManagerAccess.subscribe(
                part.alias,
                eventHandler,
            );
        return function() { return eventRaised; };
    }

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
        it('mustBeAbleToPerformASimpleAnimation', (done) => {
            const element = this.generateDivElement();
            document.body.appendChild(element);
            const animationEngine: SingleAnimationEngine = new SingleAnimationEngine();
            const taskFlow: ITaskFlow<IAnimationFlowPart> = {
                parts: [
                    {
                        alias: 'elem',
                        elements: [ element ],
                        styles: [ 'sora-fade-out-animation' ],
                        when: null,
                    },
                ],
            };
            const partStartAccess = animationEngine.getPartStartListenerAccess();
            const partEndAccess = animationEngine.getPartEndListenerAccess();
            const partEndToken = this.checkAnimation(
                null,
                partEndAccess,
                taskFlow.parts[0],
            );
            const partStartToken = this.checkAnimation(
                null,
                partStartAccess,
                taskFlow.parts[0],
            );
            const promises: Array<Promise<void>> = animationEngine.handle(taskFlow);
            Promise.all(promises).then(function() {
                expect(partEndToken()).toBe(true);
                expect(partStartToken()).toBe(true);
                document.body.removeChild(element);
                done();
            }).catch(function(err) {
                done.fail(err);
            });
        });
    }

    private itMustBeAbleToPerformMultipleAnimations() {
        it('mustBeAbleToPerformMultipleAnimations', (done) => {
            const element1 = this.generateDivElement();
            const element2 = this.generateDivElement();
            document.body.appendChild(element1);
            document.body.appendChild(element2);
            const animationEngine: SingleAnimationEngine = new SingleAnimationEngine();
            const taskFlow: ITaskFlow<IAnimationFlowPart> = {
                parts: [
                    {
                        alias: 'elem0',
                        elements: [ element1 ],
                        styles: [ 'sora-fade-out-animation' ],
                        when: null,
                    },
                    {
                        alias: 'elem1',
                        elements: [ element2 ],
                        styles: [ 'sora-fade-out-animation' ],
                        when: null,
                    },
                ],
            };
            const partStartAccess = animationEngine.getPartStartListenerAccess();
            const partEndAccess = animationEngine.getPartEndListenerAccess();
            const partEndToken1 = this.checkAnimation(
                null,
                partEndAccess,
                taskFlow.parts[0],
            );
            const partEndToken2 = this.checkAnimation(
                null,
                partEndAccess,
                taskFlow.parts[1],
            );
            const partStartToken1 = this.checkAnimation(
                null,
                partStartAccess,
                taskFlow.parts[0],
            );
            const partStartToken2 = this.checkAnimation(
                null,
                partStartAccess,
                taskFlow.parts[1],
            );
            const promises: Array<Promise<void>> = animationEngine.handle(taskFlow);
            Promise.all(promises).then(function() {
                expect(partEndToken1()).toBe(true);
                expect(partEndToken2()).toBe(true);
                expect(partStartToken1()).toBe(true);
                expect(partStartToken2()).toBe(true);
                document.body.removeChild(element1);
                document.body.removeChild(element2);
                done();
            }).catch(function(err) {
                done.fail(err);
            });
        });
    }

    private itMustBeAbleToPerformAnimationsWhenAnimationEnds() {
        it('mustBeAbleToPerformAnimationsWhenAnimationEnds', (done) => {
            const element0 = this.generateDivElement();
            const element1 = this.generateDivElement();
            document.body.appendChild(element0);
            document.body.appendChild(element1);
            const animationEngine: SingleAnimationEngine = new SingleAnimationEngine();
            const taskFlow: ITaskFlow<IAnimationFlowPart> = {
                parts: [
                    {
                        alias: 'elem0',
                        elements: [ element0 ],
                        styles: [ 'sora-fade-out-animation' ],
                        when: new TaskPartEndConstraint(null, 'elem1'),
                    },
                    {
                        alias: 'elem1',
                        elements: [ element1 ],
                        styles: [ 'sora-fade-out-animation' ],
                        when: null,
                    },
                ],
            };
            const partStartAccess = animationEngine.getPartStartListenerAccess();
            const partEndAccess = animationEngine.getPartEndListenerAccess();
            const partEndToken0 = this.checkAnimation(
                null,
                partEndAccess,
                taskFlow.parts[0],
            );
            const partEndToken1 = this.checkAnimation(
                null,
                partEndAccess,
                taskFlow.parts[1],
            );
            const partStartToken0 = this.checkAnimation(
                function(eventArgs) { expect(partEndToken1()).toBe(true); },
                partStartAccess,
                taskFlow.parts[0],
            );
            const partStartToken1 = this.checkAnimation(
                null,
                partStartAccess,
                taskFlow.parts[1],
            );
            const promises: Array<Promise<void>> = animationEngine.handle(taskFlow);
            Promise.all(promises).then(function() {
                expect(partEndToken0()).toBe(true);
                expect(partEndToken1()).toBe(true);
                expect(partStartToken0()).toBe(true);
                expect(partStartToken1()).toBe(true);
                document.body.removeChild(element0);
                document.body.removeChild(element1);
                done();
            }).catch(function(err) {
                done.fail(err);
            });
        });
    }

    private itMustBeAbleToPerformAnimationsWhenAnimationStarts() {
        it('mustBeAbleToPerformAnimationsWhenAnimationStarts', (done) => {
            const element0 = this.generateDivElement();
            const element1 = this.generateDivElement();
            document.body.appendChild(element0);
            document.body.appendChild(element1);
            const animationEngine: SingleAnimationEngine = new SingleAnimationEngine();
            const taskFlow: ITaskFlow<IAnimationFlowPart> = {
                parts: [
                    {
                        alias: 'elem0',
                        elements: [ element0 ],
                        styles: [ 'sora-fade-out-animation' ],
                        when: new TaskPartBeginConstraint(null, 'elem1'),
                    },
                    {
                        alias: 'elem1',
                        elements: [ element1 ],
                        styles: [ 'sora-fade-out-animation' ],
                        when: null,
                    },
                ],
            };
            const partStartAccess = animationEngine.getPartStartListenerAccess();
            const partEndAccess = animationEngine.getPartEndListenerAccess();
            const partEndToken0 = this.checkAnimation(
                null,
                partEndAccess,
                taskFlow.parts[0],
            );
            const partEndToken1 = this.checkAnimation(
                null,
                partEndAccess,
                taskFlow.parts[1],
            );
            const partStartToken0 = this.checkAnimation(
                function(eventArgs) { expect(partStartToken1()).toBe(true); },
                partStartAccess,
                taskFlow.parts[0],
            );
            const partStartToken1 = this.checkAnimation(
                null,
                partStartAccess,
                taskFlow.parts[1],
            );
            const promises: Array<Promise<void>> = animationEngine.handle(taskFlow);
            Promise.all(promises).then(function() {
                expect(partEndToken0()).toBe(true);
                expect(partEndToken1()).toBe(true);
                expect(partStartToken0()).toBe(true);
                expect(partStartToken1()).toBe(true);
                document.body.removeChild(element0);
                document.body.removeChild(element1);
                done();
            }).catch(function(err) {
                done.fail(err);
            });
        });
    }

    private itMustBeAbleToPerformAnimationAfterMillis() {
        it('mustBeAbleToPerformAnimationAfterMillis', (done) => {
            const element = this.generateDivElement();
            document.body.appendChild(element);
            const animationEngine: SingleAnimationEngine = new SingleAnimationEngine();
            const timeToWait = 1000;
            const taskFlow: ITaskFlow<IAnimationFlowPart> = {
                parts: [
                    {
                        alias: 'elem',
                        elements: [ element ],
                        styles: [ 'sora-fade-out-animation' ],
                        when: new TaskTimeConstraint(null, timeToWait),
                    },
                ],
            };
            const partStartAccess = animationEngine.getPartStartListenerAccess();
            const partEndAccess = animationEngine.getPartEndListenerAccess();
            const partEndToken = this.checkAnimation(
                null,
                partEndAccess,
                taskFlow.parts[0],
            );
            const partStartToken = this.checkAnimation(
                null,
                partStartAccess,
                taskFlow.parts[0],
            );
            const now = new Date();
            const promises: Array<Promise<void>> = animationEngine.handle(taskFlow);
            Promise.all(promises).then(function() {
                expect(new Date().getTime() - now.getTime()).toBeGreaterThanOrEqual(timeToWait);
                expect(partEndToken()).toBe(true);
                expect(partStartToken()).toBe(true);
                document.body.removeChild(element);
                done();
            }).catch(function(err) {
                done.fail(err);
            });
        });
    }
}
