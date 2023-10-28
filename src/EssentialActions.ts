import { linkAction } from './mount';

linkAction.register('all', (event, args) =>
    Promise.all(
        (args as [string, ...unknown[]][]).map(([name, ...args]) =>
            linkAction.execute(name, event, ...args)
        )
    )
);
linkAction.register('race', (event, args) =>
    Promise.race(
        (args as [string, ...unknown[]][]).map(([name, ...args]) =>
            linkAction.execute(name, event, ...args)
        )
    )
);
linkAction.register('allSettled', (event, args) =>
    Promise.allSettled(
        (args as [string, ...unknown[]][]).map(([name, ...args]) =>
            linkAction.execute(name, event, ...args)
        )
    )
);
linkAction.register('any', (event, args) =>
    Promise.any(
        (args as [string, ...unknown[]][]).map(([name, ...args]) =>
            linkAction.execute(name, event, ...args)
        )
    )
);
// eslint-disable-next-line @typescript-eslint/no-empty-function
linkAction.register('void', () => {});
