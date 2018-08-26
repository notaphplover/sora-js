import {
    ITaskPartWhenConstraint,
    TaskPartWhenConstraint,
} from './task-flow-when';
import {
    TASK_CONSTRAINT_TYPES,
    TaskPartConstraint,
} from './task-part-constraint';

/**
 * Represents a when constraint that is checked once an amount of time passes.
 */
export class TaskTimeConstraint extends TaskPartWhenConstraint {
    /**
     * Milliseconds to wait.
     */
    public millis: number;

    public constructor(after: ITaskPartWhenConstraint, millis: number) {
        super(after, TASK_CONSTRAINT_TYPES.WAIT_FOR);

        this.millis = millis;
    }
}
