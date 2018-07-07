import { SoraAnimation }  from './animation/carousel-animation';

export namespace CarouselBase {
    
    /**
     * Represents a generic carousel.
     * 
     * 1. Any carousel has elements.
     * 2. Any carousel has a topology.
     * 3. Any carousel has transitions.
     */
    export abstract class CarouselBase<TElems> {
        /**
         * Elements of the carousel
         * 1. Any carousel has elements.
         * 2. Any carousel has a topology.
         */
        protected elements : TElems;

        /**
         * Creates a new carousel.
         * @param elements 
         */
        public constructor(elements : TElems) {
            this.elements = elements;
        }

        /**
         * Carousel handler.
         * 3. Any carousel has transitions.
         * @param action action to be handled
         * @param options options for the action.
         */
        public abstract handle(action: string, options : {[key: string] : any}) : void;
    }
}
