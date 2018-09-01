import { IOperationArgs } from '../operation/operation-manager';
import { ITaskFlowPart } from './task-flow-part';

export interface ITaskFlowPartArgs<TPart extends ITaskFlowPart> extends IOperationArgs {
    /**
     * Target part
     */
    part: TPart;
}

/**
 * Represents the arguments for an event raised once an animation part starts.
 */
export interface ITaskFlowPartEndArgs<TPart extends ITaskFlowPart> extends ITaskFlowPartArgs<TPart> { }

/**
 * Represents the arguments for an event raised once an animation part ends.
 */
export interface ITaskFlowPartStartArgs<TPart extends ITaskFlowPart> extends ITaskFlowPartArgs<TPart> { }
