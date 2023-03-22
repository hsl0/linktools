import { printError } from './common';
import type { HTMLElements } from './common';

/**
 * @callback LinkModifier
 * @param link Link element (anchor element) object
 * @param caller link-modifier class element that called this modifier
 */
type LinkModifier = (
    link: HTMLAnchorElement,
    caller: HTMLElement
) => unknown | PromiseLike<unknown>;

/** Stores link modifiers */
export default class LinkModifierCollection {
    /** Named modifier storage */
    private modifiers: Record<string, LinkModifier> = {};

    /**
     * Construct LinkModifierCollection
     * @param modifiers Object of link modifiers that are being added for collection. Key for modifier's name.
     */
    constructor(
        modifiers?: Record<string, LinkModifier> | LinkModifierCollection
    ) {
        if (modifiers) this.add(modifiers);
    }

    /**
     * Add multiple named link modifier in once
     * @param modifiers Object of named link modifier. Key for modifier's name. Value for modifier function or name of alias.
     */
    add(
        modifiers:
            | Record<string, LinkModifier | string>
            | LinkModifierCollection
    ): void;

    //add(modifiers: HTMLElements): void;

    /**
     * Add a named link modifier
     * @param name Name of link modifier
     * @param modifier Link modifier function
     */
    add(name: string, modifier: LinkModifier): void;

    /**
     * Add a named link modifier
     * @param names Names of link modifier
     * @param modifier Link modifier function
     */
    add(names: string[] | Set<string>, modifier: LinkModifier): void;

    /**
     * Add a alias of named link modifier
     * @param alias Alias of link modifier
     * @param modifier Link modifier name
     */
    add(alias: string, modifier: string): void;

    /**
     * Add aliases of named link modifier
     * @param aliases Aliases of link modifier
     * @param modifier Link modifier name
     */
    add(aliases: string[] | Set<string>, modifier: string): void;

    add(
        a:
            | string
            | string[]
            | Set<string>
            | Record<string, LinkModifier | string>
            | LinkModifierCollection,
        b?: LinkModifier | string
    ) {
        switch (typeof a) {
            case 'string':
                // name = a;
                switch (typeof b) {
                    case 'function':
                        // Single modifier
                        this.modifiers[a] = b;
                        break;
                    case 'string':
                        // Single alias
                        if (b in this.modifiers)
                            this.modifiers[a] = this.modifiers[b];
                        else
                            throw new ReferenceError(
                                `Link modifier '${b}' is not exist`
                            );
                        break;
                    default:
                        throw new TypeError('Modifier is not function');
                }
                break;
            case 'object':
                if (a instanceof LinkModifierCollection)
                    // Multiple modifiers
                    Object.assign(this.modifiers, a.modifiers);
                else if (Array.isArray(a) || a instanceof Set)
                    // Multiple aliases
                    switch (typeof b) {
                        case 'function':
                        case 'string':
                            //@ts-ignore Valid union overload
                            a.forEach((name: string) => this.add(name, b));
                            break;
                        default:
                            throw new TypeError(
                                'Second argument is not function or string'
                            );
                    }
                // Multiple modifiers
                //@ts-ignore Valid union overload
                else for (const name in a) this.add(name, a[name]);
                break;
            default:
                throw TypeError(
                    'First argument is not name string or modifiers object'
                );
        }
    }

    /**
     * Unregister named link modifier
     * @param name Name of link modifier
     */
    remove(name: string): void {
        if (name === 'string') delete this.modifiers[name];
        else throw new TypeError('Name is not string');
    }

    /**
     * Mount the collection's modifiers to child elements which its modifiers are defined
     * @param element Target parent element
     * @param options Mount options
     * @returns Async modification promise
     */
    mount(
        element: HTMLElements,
        {
            force,
        }: {
            /** If true, always mount even when already mounted. If false, don't mount when already mounted. Default is false. */
            force: boolean;
        } = { force: false }
    ): PromiseLike<unknown> {
        const collection = this;
        let globalPromise: PromiseLike<unknown> = Promise.resolve();
        const localPromises: PromiseLike<unknown>[] = [];

        // Named modifiers
        $('.link-modifier-cloak').addClass('link-modifier');

        //@ts-ignore Valid union overload
        element = $<HTMLElement>(element);

        if ((element as JQuery).is('.link-modifier'))
            element = (element as JQuery).find('a');
        else element = (element as JQuery).find('.link-modifier a');

        (element as JQuery).each(function () {
            const link = this as HTMLAnchorElement;
            let localPromise: PromiseLike<unknown> = Promise.resolve();

            $(this)
                .parents('.link-modifier')
                .each(function () {
                    if (!force && this.classList.contains('link-modified'))
                        return;

                    const name = this.dataset.modifier;

                    if (!name) {
                        console.error(
                            this,
                            new TypeError(
                                'data-modifier 속성에 링크 수정자를 지정하지 않았습니다'
                            )
                        );
                        if (this.classList.contains('link-modifier-cloak'))
                            printError(
                                this,
                                'data-modifier 속성에 링크 수정자를 지정하지 않았습니다'
                            );
                        return;
                    }

                    if (!collection.modifiers[name]) {
                        console.error(
                            this,
                            new TypeError(
                                `링크 수정자 '${name}'은(는) 존재하지 않습니다`
                            )
                        );
                        if (this.classList.contains('link-modifier-cloak'))
                            printError(
                                this,
                                `링크 수정자 '${name}'은(는) 존재하지 않습니다`
                            );
                        return;
                    }

                    localPromise = localPromise
                        .then(() => collection.modifiers[name](link, this))
                        .then(() => {
                            this.classList.remove('link-modifier-cloak');
                            this.classList.add('link-modified');
                        });
                });

            localPromises.push(localPromise);
        });

        globalPromise = globalPromise.then(() =>
            Promise.allSettled(localPromises)
        );

        return globalPromise;
    }

    /**
     * Forks modifiers collection
     * @returns New modifiers collection that contains member modifiers of this collection
     */
    fork(): LinkModifierCollection {
        return new LinkModifierCollection(this);
    }
}
