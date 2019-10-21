import {
    Component,
    OnInit,
    Input,
    ElementRef,
    ViewChild,
    Output,
    EventEmitter,
    OnDestroy,
} from '@angular/core';
import {
    OperatorCard,
    DraggableCard,
    NumberCard,
    CardType,
} from 'src/app/core/models/game/card.model';
import {
    BehaviorSubject,
    Observable,
    timer,
    fromEvent,
    Subject,
    combineLatest,
    race,
    zip,
} from 'rxjs';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import {
    startWith,
    take,
    map,
    filter,
    debounce,
    debounceTime,
    share,
    takeUntil,
    pluck,
    withLatestFrom,
    takeLast,
    switchMap,
    tap,
    mapTo,
    takeWhile,
    endWith,
    mergeMap,
} from 'rxjs/operators';
import { DragAndDropService } from './drag-and-drop.service';
import { isNumber, isOperator } from 'src/app/core/functions/predicates';
import { NzModalService } from 'ng-zorro-antd';
import { StateService, AppEventType } from 'src/app/core/service/state.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { GameEventType } from './game-state.service';

@Component({
    selector: 'app-game-field',
    templateUrl: './game-field.component.html',
    styleUrls: ['./game-field.component.scss'],
})
export class GameFieldComponent implements OnInit, OnDestroy {
    @Input() player;
    isCurrentPlayer$ = combineLatest([this.authService.player$]).pipe(
        map(([c]) => this.player.id === c.id),
    );

    @Output() exit = new EventEmitter();
    // Game Data
    numbers$ = this.dndService.numbers$;
    answer$ = this.dndService.answer$;
    question$ = this.dndService.question$;
    expectedAnswer$ = this.dndService.expectedAnswer$;

    // Game Validation
    wrongPositions$ = this.dndService.wrongPositions$;
    isValidAnswer$ = this.dndService.isValidAnswer$;
    currentAnswer$ = this.dndService.currentAnswer$;
    operators$ = this.dndService.operators$;

    addNumber = this.dndService.addNumber;
    addOperator = this.dndService.addOperator;
    dropNumber = this.dndService.dropNumber;
    dropOperator = this.dndService.dropOperator;
    dropAnswer = this.dndService.dropAnswer;
    removeCard = this.dndService.removeCard;
    removeNumber = this.dndService.removeNumber;
    removeOperator = this.dndService.removeOperator;

    operators = this.dndService.operators;

    @ViewChild('main', { static: true }) main: ElementRef;

    timer$: Observable<number>;
    isGaming$ = this.stateService.game$.pipe(map(e => !!e));
    playable$ = new BehaviorSubject<boolean>(false);

    destroy$ = new Subject();

    resetTimer$ = new Subject();

    keypress$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
        takeUntil(this.destroy$),
        pluck('key'),
    );

    reset = () => this.dndService.reset();

    constructor(
        private dndService: DragAndDropService,
        private modalService: NzModalService,
        private stateService: StateService,
        private authService: AuthService,
    ) {}

    skip() {
        this.resetTimer$.next();
        this.stateService.sendEvent({
            type: GameEventType.SKIP,
        });
    }

    okClick() {
        this.stateService.sendEvent({
            type: GameEventType.OK_CLICK,
        });
        this.resetTimer$.next();
    }
    ngOnDestroy() {
        this.destroy$.next();
    }
    ngOnInit() {
        this.stateService.win$
            .pipe(
                takeUntil(this.destroy$),
                debounceTime(500),
            )
            .subscribe(timeLeft => {
                this.showWinDialog(timeLeft);
            });
        this.stateService.lose$
            .pipe(
                takeUntil(this.destroy$),
                debounceTime(500),
            )
            .subscribe(() => {
                this.showLoseDialog();
            });
        combineLatest([
            this.stateService.question$,
            this.stateService.expectedAnswer$,
        ])
            .pipe(
                filter(
                    ([question, expectedAnswer]) =>
                        !!question && !!expectedAnswer,
                ),
                takeUntil(this.destroy$),
                debounceTime(100),
            )
            .subscribe(([question, expectedAnswer]: [number[], number]) => {
                this.dndService.setQuestion({ question, expectedAnswer });
            });
        this.keypress$
            .pipe(
                withLatestFrom(
                    this.numbers$,
                    this.answer$,
                    this.isGaming$,
                    this.playable$,
                ),
                takeUntil(this.destroy$),
                // filter(([, , , isGaming, playable]) => isGaming && playable),
            )
            .subscribe(args => this.handleKeypress(args));
        combineLatest([this.question$, this.expectedAnswer$, this.answer$])
            .pipe(
                takeUntil(this.destroy$),
                debounceTime(100),
            )
            .subscribe(([question, expectedAnswer, answer]) => {
                this.stateService.sendEvent({
                    type: GameEventType.ATTEMPT,
                    payload: {
                        expectedAnswer,
                        answer: answer.map(e => e.value),
                    },
                });
            });
        this.startGame();
    }

    handleKeypress([key, numbers, answers]: [
        string,
        NumberCard[],
        DraggableCard[],
        boolean,
        boolean
    ]) {
        if (isNumber(key)) {
            const n = Number(key);
            const idx = numbers.findIndex(e => e.value === n);
            if (idx >= 0) {
                this.addNumber(numbers[idx], idx);
            }
        } else if (isOperator(this.operators.map(e => e.value), key)) {
            const idx = this.operators.findIndex(e => e.value === key);
            if (idx >= 0) {
                this.addOperator(this.operators[idx], idx);
            }
        } else if (key === 'Backspace') {
            const idx = answers.length - 1;
            if (idx >= 0) {
                this.removeCard(answers[idx], idx);
            }
        }
    }

    createTimer(startTime?: Date) {
        const n = 60;
        this.timer$ = this.resetTimer$.pipe(
            startWith(undefined),
            switchMap(() =>
                timer(new Date(), 1000).pipe(
                    take(n + 1),
                    map(t => n - t),
                ),
            ),
            tap(time => {
                if (time === 0) {
                    this.stateService.sendEvent({
                        type: GameEventType.LOSE,
                    });
                } else {
                    this.stateService.sendEvent({
                        type: GameEventType.TIMER,
                        payload: time,
                    });
                }
            }),
        );
    }

    /* Drag and Drop Stuff */
    startGame() {
        const future = new Date().valueOf() + 1000;
        this.createTimer(new Date(future));
        this.timer$.pipe(takeUntil(this.destroy$)).subscribe();
    }

    showWinDialog(timeLeft: number) {
        this.modalService.success({
            nzTitle: 'You win !',
            nzContent: `It took you ${60 -
                timeLeft} seconds for you to solve this`,
            nzCancelText: 'Exit Game',
            nzOnOk: () => this.okClick(),
            nzOnCancel: () => this.endGame(),
            nzKeyboard: false,
        });
    }

    showLoseDialog() {
        this.modalService.error({
            nzTitle: 'You Lose !',
            nzContent: 'Some Discouraging message',
            nzCancelText: 'Exit Game',
            nzOnOk: () => this.okClick(),
            nzOnCancel: () => this.endGame(),
            nzKeyboard: false,
        });
    }

    endGame() {
        this.exit.emit();
        this.stateService.sendEvent({
            type: AppEventType.END_GAME,
        });
    }

    onDragEnded(event: CdkDragEnd) {
        event.source.element.nativeElement.style.transform = 'none'; // visually reset element to its origin
        const source: any = event.source;
        source._passiveTransform = { x: 0, y: 0 }; // make it so new drag starts from same origin
    }

    isNumber(item: CdkDrag<DraggableCard>) {
        return item.data.type === CardType.number;
    }

    isOperator(item: CdkDrag<DraggableCard>) {
        return item.data.type === CardType.operator;
    }
}
