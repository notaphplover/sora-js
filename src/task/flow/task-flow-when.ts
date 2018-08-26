/**
 * Constraint that determines the start of the task part.
 */
export interface ITaskPartWhenConstraint {
    /**
     * When entity to check once this constraint is ensured.
     */
    after: ITaskPartWhenConstraint;
    /**
     * Type of this constraint.
     */
    constraintType: string;
}

/**
 * Constraint that determines the start of the task part.
 */
export abstract class TaskPartWhenConstraint implements ITaskPartWhenConstraint {
    /**
     * When entity to check once this constraint is ensured.
     */
    public after: ITaskPartWhenConstraint;
    /**
     * Type of this constraint.
     */
    public constraintType: string;

    /**
     * Creates a new task part constraint.
     * @param after Constraint to apply after this constraint is checked.
     * @param constraintType Constraint type.
     */
    public constructor(after: ITaskPartWhenConstraint, constraintType: string) {
        this.after = after;
        this.constraintType = constraintType;
    }
}
