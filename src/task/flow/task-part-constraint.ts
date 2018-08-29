import {
    ITaskPartWhenConstraint,
    TaskPartWhenConstraint,
} from './task-flow-when';

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

export abstract class TaskPartConstraint extends TaskPartWhenConstraint {
    /**
     * Alias of the part affected by this constraint.
     */
    public alias: string;

    /**
     * Creates a new task part constraint.
     * @param after Constraint to apply after this constraint is checked.
     * @param alias Aliases of the parts affected by this constraint.
     * @param constraintType Constraint type.
     */
    public constructor(after: ITaskPartWhenConstraint, alias: string, constraintType: string) {
        super(after, constraintType);

        this.alias = alias;
    }
}
