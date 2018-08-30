import { IAnimationFlowPart } from '../../animation/animation-flow-part';
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
    partEndEventAccess: IOperationManagerAccess<ITaskFlowPartEndArgs<IAnimationFlowPart>>;
    /**
     * Part start event acess for the current animation.
     */
    partStartEventAccess: IOperationManagerAccess<ITaskFlowPartStartArgs<IAnimationFlowPart>>;
    /**
     * Promise resolved once Sora has ended the handling of the animation.
     */
    soraHandlerStatus: Promise<void>;
}
