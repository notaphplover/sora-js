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

    /**
     * Search a task part by its alias.
     * @param alias Alias of the part to search.
     */
    getPartByAlias(alias: string): TPart;
}
