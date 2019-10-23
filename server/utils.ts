import { tap } from 'rxjs/operators';
export const log = <T>(stuff?: (fn: T) => string | string) =>
    tap<T>(data => {
        if (typeof stuff === 'string') console.log(stuff);
        else if (typeof stuff === 'function') console.log(stuff(data));
        else console.log(data);
    });
