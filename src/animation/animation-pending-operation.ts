export interface IAnimationFlowPartPendingOperation {
    /**
     * Token of the subscriber of the operation;
     */
    operationToken: number;
    /**
     * True if the operation is pending.
     */
    isPending: boolean;
}
