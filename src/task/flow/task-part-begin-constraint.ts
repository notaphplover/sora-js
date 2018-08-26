import { ITaskPartWhenConstraint } from './task-flow-when';
import {
    TASK_CONSTRAINT_TYPES,
    TaskPartConstraint,
} from './task-part-constraint';

/**
 * Represents a when constraint that is checked once a task part starts.
 */
export class TaskPartBeginConstraint extends TaskPartConstraint {
    public constructor(after: ITaskPartWhenConstraint, alias: string) {
        super(after, alias, TASK_CONSTRAINT_TYPES.START);
    }
}
