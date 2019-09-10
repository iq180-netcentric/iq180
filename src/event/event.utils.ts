import { filter } from 'rxjs/operators';
import { WebSocketEvent } from './event.type';

export const filterEvent = <T = any>(event: string) =>
    filter((wsEvent: WebSocketEvent<T>) => wsEvent.event === event);
