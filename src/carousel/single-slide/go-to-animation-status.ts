import {
    ITaskFlowPartEndArgs,
    ITaskFlowPartStartArgs,
} from 'jovellanos/src/task/flow/task-flow-part-event-args';
import { IOperationManagerAccess } from 'jovellanos/src/task/operation/operation-manager-access';
import { IAnimationFlowPart } from '../../animation/animation-flow-part';

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
