import { TaskPartWhenOperator } from '../task-engine';
import {
    ITaskPartWhenConstraint,
    TaskPartWhenConstraint,
} from './task-flow-when';
import { TASK_CONSTRAINT_TYPES } from './task-part-constraint';

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
    public constructor(
        after: ITaskPartWhenConstraint,
        constraints: ITaskPartWhenConstraint[],
        operator: TaskPartWhenOperator,
    ) {
        super(after, TASK_CONSTRAINT_TYPES.GROUP);

        this.constraints = constraints;
        this.operator = operator;
    }
}
