import { EventEmitter } from "events";

/**
 * Task constraint types
 */
export const TASK_CONSTRAINT_TYPES = {
    /**
     * Requires the end of a task part.
     */
    END: 'anim.end',
    /**
     * Requires a group of constraints.
     */
    GROUP: 'group',
    /**
     * Requires the start of a task part.
     */
    START : 'anim.start',
    /**
     * Requires an amount of time.
     */
    WAIT_FOR: 'wait',
};

/**
 * Prefixes used to ganerate alias for events over task parts.
 */
const TASK_PART_WHEN_EVENT_PREFIXES = {
    /**
     * Prefix for any event raised once a task part is started.
     */
    START: 'anim.start.',
    /**
     * Prefix for any event raised once a task part is ended.
     */
    END: 'anim.end.',
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
 * Task flow.
 *
 * The flow is composed by parts.
 */
export interface ITaskFlow<TPart extends ITaskFlowPart> {
    /**
     * Task parts.
     */
    parts : TPart[],

    /**
     * Search a task part by its alias.
     * @param alias Alias of the part to search.
     */
    getPartByAlias(alias : string) : TPart,
}

/**
 * Task flow part.
 */
export interface ITaskFlowPart {
    /**
     * Alias of the part
     */
    alias: string,
    /**
     * Constraints to ensure before applying the styles.
     */
    when: ITaskPartWhenConstraint,
}

/**
 * Constraint that determines the start of the task part.
 */
export interface ITaskPartWhenConstraint {
    /**
     * When entity to check once this constraint is ensured.
     */
    after: ITaskPartWhenConstraint,
    /**
     * Type of this constraint.
     */
    constraintType: string,
}

/**
 * Constraint that determines the start of the task part.
 */
export abstract class TaskPartWhenConstraint implements ITaskPartWhenConstraint {
    /**
     * When entity to check once this constraint is ensured.
     */
    public after : ITaskPartWhenConstraint;
    /**
     * Type of this constraint.
     */
    public constraintType : string;

    /**
     * Creates a new task part constraint.
     * @param after Constraint to apply after this constraint is checked.
     * @param constraintType Constraint type.
     */
    public constructor(after : ITaskPartWhenConstraint, constraintType : string) {
        this.after = after;
        this.constraintType = constraintType;
    }
}

export abstract class TaskPartConstraint extends TaskPartWhenConstraint {
    /**
     * Aliases of the parts affected by this constraint.
     */
    public alias : string;

    /**
     * Creates a new task part constraint.
     * @param after Constraint to apply after this constraint is checked.
     * @param alias Aliases of the parts affected by this constraint.
     * @param constraintType Constraint type.
     */
    public constructor(after : ITaskPartWhenConstraint, alias : string, constraintType : string) {
        super(after, constraintType);

        this.alias = alias;
    }
}

/**
 * Represents a when constraint that is checked once a task part starts.
 */
export class TaskPartBeginConstraint extends TaskPartConstraint {
    public constructor(after : ITaskPartWhenConstraint, alias : string) {
        super(after, alias, TASK_CONSTRAINT_TYPES.START)
    }
}

/**
 * Represents a when constraint that is checked once a task part ends.
 */
export class TaskPartEndConstraint extends TaskPartConstraint {
    public constructor(after : ITaskPartWhenConstraint, alias : string) {
        super(after, alias, TASK_CONSTRAINT_TYPES.END)
    }
}

/**
 * Represents a when constraint that is checked once an amount of time passes.
 */
export class TaskTimeConstraint extends TaskPartWhenConstraint {
    /**
     * Milliseconds to wait.
     */
    public millis : number;

    public constructor(after : ITaskPartWhenConstraint, millis : number) {
        super(after, TASK_CONSTRAINT_TYPES.WAIT_FOR);

        this.millis = millis;
    }
}

/**
 * Represents a when constraint that is checked once a group of constraints are checked.
 */
export class TaskGroupConstraint extends TaskPartWhenConstraint {
    /**
     * Constraints to ensure
     */
    public constraints: ITaskPartWhenConstraint[];
    /**
     * Logical operator
     */
    public operator: TaskPartWhenOperator;

    /**
     * Creates a new instance.
     *
     * @param after Constraint to check after all the constraitns of the group have successfully checked.
     * @param constraints Group of constraints to check.
     * @param operator Logical operator to apply.
     */
    public constructor(after : ITaskPartWhenConstraint, constraints: ITaskPartWhenConstraint[], operator: TaskPartWhenOperator) {
        super(after, TASK_CONSTRAINT_TYPES.GROUP);

        this.constraints = constraints;
        this.operator = operator;
    }
}

/**
 * Represenrts a task engine.
 */
export abstract class TaskEngine<TPart extends ITaskFlowPart> {
    //#region Attributes

    /**
     * Task currently managed.
     */
    protected currentTask : ITaskFlow<TPart>;

    /**
     * Event emitter to use
     */
    protected eventEmitter : EventEmitter;

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
    public handle(taskFlow : ITaskFlow<TPart>) : Promise<void>[] {

        if (taskFlow == null)
            throw new Error('It\'s required a task flow.');

        if (taskFlow.parts == null)
            throw new Error('It\'s required a task flow with parts.');

        this.currentTask = taskFlow;
        var partPromises : Promise<void>[] = new Array(taskFlow.parts.length);

        for (var i = 0; i < taskFlow.parts.length; ++i)
            partPromises[i] = this.handleTaskPart(taskFlow.parts[i]);

        return partPromises;
    }

    /**
     * Handles a task part.
     *
     * @param part Task part to handle.
     *
     * @returns Promise resolved once the part of the task is finished.
     */
    protected handleTaskPart(part : TPart) : Promise<void> {
        var that = this;

        return new Promise<void>(function(resolve, reject) {
            that.handleTaskPartWhen(part.when).then(function() {
                //1. Emit the start of task part.
                that.eventEmitter.emit(TASK_PART_WHEN_EVENT_PREFIXES.START + part.alias, {});

                var promise : PromiseLike<{} | void> = that.performTask(part);

                promise.then(function() {
                    // 3. Emit the end of the task part and resolve the promise.
                    that.eventEmitter.emit(TASK_PART_WHEN_EVENT_PREFIXES.END + part.alias, {});
                    resolve();
                });
            }).catch(function(err : any) {
                reject(err);
            });
        });
    }

    /**
     * Performs a task part.
     * @param part Task part to be performed.
     * @returns Promise resolved once the part task is performed.
     */
    protected abstract performTask(part : TPart) : PromiseLike<{} | void>

    //#region TaskPartWhenconstraint

    /**
     * Handles the when entity of a task part.
     *
     * @param whenEntity When entity to handle.
     *
     * @returns Promise resolved once the when entity is checked.
     */
    protected handleTaskPartWhen(whenEntity : ITaskPartWhenConstraint) : Promise<void> {
        var that = this;
        return new Promise<void>(function(resolve, reject) {
            if (whenEntity == null)
                resolve();
            else
                switch(whenEntity.constraintType) {
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
        });
    }

    /**
     * Handles the when entity (TaskPartBeginConstraint) of a task part.
     *
     * @param whenEntity When entity to handle.
     * @returns Promise resolved once the when entity is checked.
     */
    protected handleTaskPartWhenPartBegins(whenEntity : TaskPartBeginConstraint) : Promise<void> {
        var that = this;
        return new Promise<void>(function(resolve, reject) {
            var eventName = TASK_PART_WHEN_EVENT_PREFIXES.START + whenEntity.alias;
            var eventHandler = function() {
                that.eventEmitter.removeListener(eventName, eventHandler);
                if (whenEntity.after == null)
                    resolve();
                else
                    that.handleTaskPartWhen(whenEntity.after)
                        .then(resolve);
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
    protected handleTaskPartWhenPartEnds(whenEntity : TaskPartEndConstraint) : Promise<void> {
        var that = this;
        return new Promise<void>(function(resolve, reject) {
            var eventName = TASK_PART_WHEN_EVENT_PREFIXES.END + whenEntity.alias;
            var eventHandler = function() {
                that.eventEmitter.removeListener(eventName, eventHandler);
                if (whenEntity.after == null)
                    resolve();
                else
                    that.handleTaskPartWhen(whenEntity.after)
                        .then(resolve);
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
    protected handleTaskPartWhenPartGroup(whenEntity : TaskGroupConstraint) : Promise<void> {
        var that = this;
        return new Promise<void>(function(resolve, reject) {
            var childPromises : Promise<void>[] = new Array(whenEntity.constraints.length);

            for (var i = 0; i < whenEntity.constraints.length; ++i) {
                childPromises[i] = new Promise<void>(function(resolve, reject) {
                    that.handleTaskPartWhen(whenEntity.constraints[i])
                        .then(resolve);
                });
            }

            if (TaskPartWhenOperator.AND == whenEntity.operator)
                Promise.all(childPromises)
                    .then(function() {
                        resolve();
                    });
            else if (TaskPartWhenOperator.OR == whenEntity.operator)
                Promise.race(childPromises)
                .then(function() {
                    resolve();
                });
            else
                reject('Unexpected operator.')
        });
    }

    /**
     * Handles the when entity (TaskTimeConstraint) of a task part.
     *
     * @param whenEntity When entity to handle.
     *
     * @returns Promise resolved once the when entity is checked.
     */
    protected handleTaskPartWhenWaitFor(whenEntity : TaskTimeConstraint) : Promise<void> {
        var that = this;
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