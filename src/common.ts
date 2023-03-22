export type HTMLElements<Element extends HTMLElement = HTMLElement> =
    | Element
    | ArrayLike<Element>
    | string;

export function printError(element: HTMLElement, message: string) {
    $(element).addClass('error').empty().text(message);
}
