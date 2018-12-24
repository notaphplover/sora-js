import { ITaskFlowPart } from 'jovellanos/src/task/flow/task-flow-part';
import { IAnimationFlowPartPendingOperations } from './animation-pending-operations';

/**
 * Animation flow part.
 */
export interface IAnimationFlowPart extends ITaskFlowPart {
    /**
     * Elements targeted by the part.
     */
    elements: HTMLElement[];
    /**
     * Pending operations.
     */
    pendingOperations?: IAnimationFlowPartPendingOperations;
    /**
     * Animation styles to apply.
     */
    styles: string[];
}
