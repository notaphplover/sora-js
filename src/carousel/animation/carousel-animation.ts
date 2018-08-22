export interface ICarouselAnimation {
    childrenStyles?: ICarouselAnimationChildrenStyles[],
    slideStyles: string[],
}

export interface ICarouselAnimationChildrenStyles {
    selector: string,
    styles: string[],
}