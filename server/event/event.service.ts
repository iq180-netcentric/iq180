import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import {
    SocketClient,
    ReceiveEvent,
    EmitEvent,
    EmitMessage,
    BroadcastMessage,
} from './event.type';
import {
    OUT_EVENT,
    PlayersEvent,
    NewPlayerInfoEvent,
    OutChatMessageEvent,
    StartGameEvent,
    StartRoundEvent,
    EndGameEvent,
    EndRoundEvent,
    StartTurnEvent,
    PlayerAttemptEvent,
    EndTurnEvent,
} from './out-events';
import { IN_EVENT } from './in-events';
import { emitEvent, filterEvent } from './event.utils';

@Injectable()
export class EventService {
    constructor() {
        this.emitEvent$.subscribe(emitEvent);
    }
    receiveEvent$ = new Subject<ReceiveEvent>();

    emitEvent$ = new Subject<EmitEvent>();
    listenFor<T = any>(event: IN_EVENT) {
        return this.receiveEvent$.pipe(filterEvent<T>(event));
    }

    receiveEvent(client: SocketClient, event: IN_EVENT, data?: any) {
        this.receiveEvent$.next({ client, event, data });
    }

    emitEvent = <T>(event: OUT_EVENT) => (input: EmitMessage<T>) => {
        this.emitEvent$.next({ event, ...input });
    };

    broadcastEvent = <T>(event: OUT_EVENT) => ({
        data,
        clients,
    }: BroadcastMessage<T>) => {
        clients.forEach(client => this.emitEvent(event)({ data, client }));
    };

    broadcastOnlinePlayers = this.broadcastEvent<PlayersEvent>(
        OUT_EVENT.PLAYERS,
    );

    emitNewPlayerInfo = this.emitEvent<NewPlayerInfoEvent>(
        OUT_EVENT.PLAYER_INFO,
    );

    broadcastChatMessage = this.broadcastEvent<OutChatMessageEvent>(
        OUT_EVENT.CHAT_MESSAGE,
    );

    broadcastGameReady = this.broadcastEvent(OUT_EVENT.GAME_READY);

    broadcastStartGame = this.broadcastEvent<StartGameEvent>(
        OUT_EVENT.START_GAME,
    );

    broadcastEndGame = this.broadcastEvent<EndGameEvent>(OUT_EVENT.END_GAME);

    broadcastStartRound = this.broadcastEvent<StartRoundEvent>(
        OUT_EVENT.START_ROUND,
    );

    broadcastEndRound = this.broadcastEvent<EndRoundEvent>(OUT_EVENT.END_ROUND);

    broadcastStartTurn = this.broadcastEvent<StartTurnEvent>(
        OUT_EVENT.START_TURN,
    );

    broadcastAttempt = this.broadcastEvent<PlayerAttemptEvent>(
        OUT_EVENT.ATTEMPT,
    );

    broadcastEndTurn = this.broadcastEvent<EndTurnEvent>(OUT_EVENT.END_TURN);

    broadcastGameState = this.broadcastEvent(OUT_EVENT.GAME_STATE);
}
