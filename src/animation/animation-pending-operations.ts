import { IAnimationFlowPartPendingOperation } from './animation-pending-operation';

export interface IAnimationFlowPartPendingOperations {
    /**
     * True if the part must be cancelled.
     */
    cancel: IAnimationFlowPartPendingOperation;
    /**
     * True if the part must be paused.
     */
    pause: IAnimationFlowPartPendingOperation;
}
