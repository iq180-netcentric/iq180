import { Injectable } from '@nestjs/common';
import { RoomService } from '../room/room.service';
import { filter } from 'rxjs/operators';
import { OUT_EVENT } from './events';
import { broadcastEvent } from './ws.utils';

@Injectable()
export class GameService {
    constructor(private readonly roomService: RoomService) {}
    broadcastCurrentPlayer = () =>
        this.roomService.onlinePlayers$
            .pipe(filter(players => players.length > 0))
            .subscribe(players => {
                const playerInfo = players.map(p => p.info);
                broadcastEvent(OUT_EVENT.CONNECTED, playerInfo, players);
            });
}
