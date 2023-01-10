import { linkAction } from 'linktools';

linkAction.add('all', (event, ...args) =>
    Promise.all(
        (args as [string, ...unknown[]][]).map(([name, ...args]) => {
            return linkAction.execute(name, event, ...args);
        })
    )
);
linkAction.add('race', (event, ...args) =>
    Promise.race(
        (args as [string, ...unknown[]][]).map(([name, ...args]) => {
            return linkAction.execute(name, event, ...args);
        })
    )
);
linkAction.add('allSettled', (event, ...args) =>
    Promise.allSettled(
        (args as [string, ...unknown[]][]).map(([name, ...args]) => {
            return linkAction.execute(name, event, ...args);
        })
    )
);
