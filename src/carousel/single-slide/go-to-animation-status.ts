import {
    ITaskFlowPartEndArgs,
    ITaskFlowPartStartArgs,
} from '../../task/flow/task-flow-part-event-args';
import { IOperationManagerAccess } from '../../task/operation/operation-manager-access';

/**
 * Status of a GoTo animation
 */
export interface ISingleSlideCarouselGoToAnimationStatus {
    /**
     * Animation promises.
     */
    animationPromises: Array<Promise<void>>;
    /**
     * Part start event acess for the current animation.
     */
    partEndEventAccess: IOperationManagerAccess<ITaskFlowPartEndArgs>;
    /**
     * Part start event acess for the current animation.
     */
    partStartEventAccess: IOperationManagerAccess<ITaskFlowPartStartArgs>;
    /**
     * Promise resolved once Sora has ended the handling of the animation.
     */
    soraHandlerStatus: Promise<void>;
}
