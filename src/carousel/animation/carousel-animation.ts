export interface ICarouselAnimation {
    /**
     * Children animation options.
     */
    childrenStyles?: ICarouselAnimationChildrenStyles[];
    /**
     * Slide styles to apply.
     */
    slideStyles: string[];
}

export interface ICarouselAnimationChildrenStyles {
    /**
     * Selector to use to search the desired children elements.
     */
    selector: string;
    /**
     * Styles to apply.
     */
    styles: string[];
}
