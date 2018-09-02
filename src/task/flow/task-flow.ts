import { ITaskFlowPart } from './task-flow-part';

/**
 * Task flow.
 *
 * The flow is composed by parts.
 */
export interface ITaskFlow<TPart extends ITaskFlowPart> {
    /**
     * Task parts.
     */
    parts: TPart[];
}
