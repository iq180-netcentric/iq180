import { Injectable } from '@nestjs/common';
import { RoomService } from '../room/room.service';
import { map } from 'rxjs/operators';
import { OUT_EVENT } from './event.constants';
import { broadcastEvent } from './ws.utils';

@Injectable()
export class GameService {
    constructor(private readonly roomService: RoomService) {}
    broadcastCurrentPlayer = this.roomService.onlinePlayers$.pipe(
        map(players => {
            const playerInfo = players.map(p => p.info);
            broadcastEvent(OUT_EVENT.CONNECTED, playerInfo, players);
        }),
    );
}
