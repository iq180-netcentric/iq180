import { filter } from 'rxjs/operators';
import { ReceiveEvent, EmitEvent } from './event.type';

export const filterEvent = <T = any>(event: string) =>
    filter((wsEvent: ReceiveEvent<T>) => wsEvent.event === event);

export const emitEvent = ({ event, data, client }: EmitEvent) =>
    client.send(JSON.stringify({ event, data }));
