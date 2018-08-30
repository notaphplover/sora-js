import { IOperationArgs } from '../operation/operation-manager';
import { ITaskFlowPart } from './task-flow-part';

export interface ITaskFlowPartArgs extends IOperationArgs {
    /**
     * Target part
     */
    part: ITaskFlowPart;
}

/**
 * Represents the arguments for an event raised once an animation part starts.
 */
export interface ITaskFlowPartEndArgs extends ITaskFlowPartArgs { }

/**
 * Represents the arguments for an event raised once an animation part ends.
 */
export interface ITaskFlowPartStartArgs extends ITaskFlowPartArgs { }
