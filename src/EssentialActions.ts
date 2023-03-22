import { linkAction } from './mount';

linkAction.add('all', (event, ...args) =>
    Promise.all(
        (args as [string, ...unknown[]][]).map(([name, ...args]) =>
            linkAction.execute(name, event, ...args)
        )
    )
);
linkAction.add('race', (event, ...args) =>
    Promise.race(
        (args as [string, ...unknown[]][]).map(([name, ...args]) =>
            linkAction.execute(name, event, ...args)
        )
    )
);
linkAction.add('allSettled', (event, ...args) =>
    Promise.allSettled(
        (args as [string, ...unknown[]][]).map(([name, ...args]) =>
            linkAction.execute(name, event, ...args)
        )
    )
);
linkAction.add('any', (event, ...args) =>
    Promise.any(
        (args as [string, ...unknown[]][]).map(([name, ...args]) =>
            linkAction.execute(name, event, ...args)
        )
    )
);
// eslint-disable-next-line @typescript-eslint/no-empty-function
linkAction.add('void', () => {});
