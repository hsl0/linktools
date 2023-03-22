import LinkModifierCollection from './linkmodifier';
import { mount as mountLinkSlot } from './linkcreater';
import LinkActionCollection from './eventtools';

export const linkModifier = new LinkModifierCollection();
export const linkAction = new LinkActionCollection();

registerRenderer(async () => {
    mountLinkSlot('#mw-content-text');
    await linkModifier.mount('#mw-content-text');
});
registerHandler(() => linkAction.mount('#mw-content-text'));
