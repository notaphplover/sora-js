import { EventEmitter } from 'events';
import { ITaskFlow } from './flow/task-flow';
import { ITaskFlowPart } from './flow/task-flow-part';
import { ITaskPartWhenConstraint } from './flow/task-flow-when';
import { TaskPartBeginConstraint } from './flow/task-part-begin-constraint';
import { TASK_CONSTRAINT_TYPES } from './flow/task-part-constraint';
import { TaskPartEndConstraint } from './flow/task-part-end-constraint';
import { TaskGroupConstraint } from './flow/task-part-group-constraint';
import { TaskTimeConstraint } from './flow/task-part-time-constraint';

/**
 * Prefixes used to ganerate alias for events over task parts.
 */
const TASK_PART_WHEN_EVENT_PREFIXES = {
    /**
     * Prefix for any event raised once a task part is ended.
     */
    END: 'anim.end.',
    /**
     * Prefix for any event raised once a task part is started.
     */
    START: 'anim.start.',
};

//#region Enum

/**
 * Logical operator to apply.
 */
export enum TaskPartWhenOperator {
    /**
     * And operator.
     */
    AND,
    /**
     * Or operator.
     */
    OR,
}

//#endregion

/**
 * Represents a task engine.
 */
export abstract class TaskEngine<TPart extends ITaskFlowPart> {
    //#region Attributes

    /**
     * Task currently managed.
     */
    protected currentTask: ITaskFlow<TPart>;

    /**
     * Event emitter to use
     */
    protected eventEmitter: EventEmitter;

    //#endregion

    /**
     * Creates a new instance.
     */
    public constructor() {
        this.eventEmitter = new EventEmitter();
    }

    /**
     * Handles a task flow.
     * @param taskFlow Task flow to be managed.
     * @returns Task part promises.
     */
    public handle(taskFlow: ITaskFlow<TPart>): Array<Promise<void>> {
        if (taskFlow == null) {
            throw new Error('It\'s required a task flow.');
        }
        if (taskFlow.parts == null) {
            throw new Error('It\'s required a task flow with parts.');
        }

        this.currentTask = taskFlow;
        const partPromises: Array<Promise<void>> = new Array(taskFlow.parts.length);

        for (var i = 0; i < taskFlow.parts.length; ++i) {
            partPromises[i] = this.handleTaskPart(taskFlow.parts[i]);
        }

        return partPromises;
    }

    /**
     * Handles a task part.
     *
     * @param part Task part to handle.
     *
     * @returns Promise resolved once the part of the task is finished.
     */
    protected handleTaskPart(part: TPart): Promise<void> {
        const that = this;

        return new Promise<void>(function(resolve, reject) {
            that.handleTaskPartWhen(part.when).then(function() {
                // 1. Emit the start of task part.
                that.eventEmitter.emit(TASK_PART_WHEN_EVENT_PREFIXES.START + part.alias, {});

                const promise: PromiseLike<{} | void> = that.performTask(part);

                promise.then(function() {
                    // 3. Emit the end of the task part and resolve the promise.
                    that.eventEmitter.emit(TASK_PART_WHEN_EVENT_PREFIXES.END + part.alias, {});
                    resolve();
                });
            }).catch(function(err: any) {
                reject(err);
            });
        });
    }

    /**
     * Performs a task part.
     * @param part Task part to be performed.
     * @returns Promise resolved once the part task is performed.
     */
    protected abstract performTask(part: TPart): PromiseLike<{} | void>;

    //#region TaskPartWhenconstraint

    /**
     * Handles the when entity of a task part.
     *
     * @param whenEntity When entity to handle.
     *
     * @returns Promise resolved once the when entity is checked.
     */
    protected handleTaskPartWhen(whenEntity: ITaskPartWhenConstraint): Promise<void> {
        const that = this;
        return new Promise<void>(function(resolve, reject) {
            if (null == whenEntity) {
                resolve();
            } else {
                switch (whenEntity.constraintType) {
                    case TASK_CONSTRAINT_TYPES.START:
                        that.handleTaskPartWhenPartBegins(whenEntity as TaskPartBeginConstraint)
                            .then(resolve);
                        break;
                    case TASK_CONSTRAINT_TYPES.END:
                        that.handleTaskPartWhenPartEnds(whenEntity as TaskPartEndConstraint)
                            .then(resolve);
                        break;
                    case TASK_CONSTRAINT_TYPES.GROUP:
                        that.handleTaskPartWhenPartGroup(whenEntity as TaskGroupConstraint)
                            .then(resolve);
                        break;
                    case TASK_CONSTRAINT_TYPES.WAIT_FOR:
                        that.handleTaskPartWhenWaitFor(whenEntity as TaskTimeConstraint)
                            .then(resolve);
                        break;
                    default:
                        throw new Error('Unexpected when entity type.');
                }
            }
        });
    }

    /**
     * Handles the when entity (TaskPartBeginConstraint) of a task part.
     *
     * @param whenEntity When entity to handle.
     * @returns Promise resolved once the when entity is checked.
     */
    protected handleTaskPartWhenPartBegins(whenEntity: TaskPartBeginConstraint): Promise<void> {
        const that = this;
        return new Promise<void>(function(resolve, reject) {
            const eventName = TASK_PART_WHEN_EVENT_PREFIXES.START + whenEntity.alias;
            const eventHandler = function() {
                that.eventEmitter.removeListener(eventName, eventHandler);
                if (null == whenEntity.after) {
                    resolve();
                } else {
                    that.handleTaskPartWhen(whenEntity.after)
                        .then(resolve);
                }
            };
            that.eventEmitter.addListener(eventName, eventHandler);
        });
    }

    /**
     * Handles the when entity (TaskPartEndConstraint) of a task part.
     *
     * @param whenEntity When entity to handle.
     * @returns Promise resolved once the when entity is checked.
     */
    protected handleTaskPartWhenPartEnds(whenEntity: TaskPartEndConstraint): Promise<void> {
        const that = this;
        return new Promise<void>(function(resolve, reject) {
            const eventName = TASK_PART_WHEN_EVENT_PREFIXES.END + whenEntity.alias;
            const eventHandler = function() {
                that.eventEmitter.removeListener(eventName, eventHandler);
                if (null == whenEntity.after) {
                    resolve();
                } else {
                    that.handleTaskPartWhen(whenEntity.after)
                        .then(resolve);
                }
            };
            that.eventEmitter.addListener(eventName, eventHandler);
        });
    }

    /**
     * Handles the when entity (TaskGroupConstraint) of a task part.
     *
     * @param whenEntity When entity to handle.
     *
     * @returns Promise resolved once the when entity is checked.
     */
    protected handleTaskPartWhenPartGroup(whenEntity: TaskGroupConstraint): Promise<void> {
        const that = this;
        return new Promise<void>(function(resolve, reject) {
            const childPromises: Array<Promise<void>> = new Array(whenEntity.constraints.length);

            for (var i = 0; i < whenEntity.constraints.length; ++i) {
                childPromises[i] = new Promise<void>(function(resolve, reject) {
                    that.handleTaskPartWhen(whenEntity.constraints[i])
                        .then(resolve);
                });
            }

            if (TaskPartWhenOperator.AND === whenEntity.operator) {
                Promise.all(childPromises)
                    .then(function() {
                        resolve();
                    });
            } else if (TaskPartWhenOperator.OR === whenEntity.operator) {
                Promise.race(childPromises)
                .then(function() {
                    resolve();
                });
            } else {
                reject('Unexpected operator.');
            }
        });
    }

    /**
     * Handles the when entity (TaskTimeConstraint) of a task part.
     *
     * @param whenEntity When entity to handle.
     *
     * @returns Promise resolved once the when entity is checked.
     */
    protected handleTaskPartWhenWaitFor(whenEntity: TaskTimeConstraint): Promise<void> {
        const that = this;
        return new Promise<void>(function(resolve, reject) {
            setTimeout(function() {
                if (whenEntity.after == null) {
                    resolve();
                } else {
                    that.handleTaskPartWhen(whenEntity.after)
                        .then(resolve);
                }
            }, whenEntity.millis);
        });
    }

    //#endregion
}
