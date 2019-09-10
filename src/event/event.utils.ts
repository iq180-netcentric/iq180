import { filter } from 'rxjs/operators';
import { WebSocketEvent, EmitEvent } from './event.type';

export const filterEvent = <T = any>(event: string) =>
    filter((wsEvent: WebSocketEvent<T>) => wsEvent.event === event);

export const emitEvent = ({ event, data, client }: EmitEvent) =>
    client.send(JSON.stringify({ event, data }));
