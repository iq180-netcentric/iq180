import { tap } from 'rxjs/operators';
type ReturnString<T> = (fn: T) => string;
export const log = <T>(stuff?: ReturnString<T> | string) =>
    tap<T>(data => {
        if (typeof stuff === 'string') {
            console.log(stuff);
        } else if (typeof stuff === 'function') {
            console.log(stuff(data));
        } else {
            console.log(data);
        }
    });
