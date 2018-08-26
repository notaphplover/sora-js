import { ITaskPartWhenConstraint } from './task-flow-when';

/**
 * Task flow part.
 */
export interface ITaskFlowPart {
    /**
     * Alias of the part
     */
    alias: string;
    /**
     * Constraints to ensure before applying the styles.
     */
    when: ITaskPartWhenConstraint;
}
