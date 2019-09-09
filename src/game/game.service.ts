import { Injectable } from '@nestjs/common';
import { RoomService } from '../room/room.service';
import { filter } from 'rxjs/operators';
import { OUT_EVENT } from '../event/events';
import { broadcastEvent } from '../event/utils';

@Injectable()
export class GameService {
    constructor(private readonly roomService: RoomService) {}
    broadcastCurrentPlayer = () =>
        this.roomService.onlinePlayers$
            .pipe(filter(players => players.length > 0))
            .subscribe(players => {
                const playerInfo = players.map(p => p.playerInfo);
                const clients = players.map(p => p.client);
                broadcastEvent(OUT_EVENT.CONNECTED, playerInfo, clients);
            });
}
