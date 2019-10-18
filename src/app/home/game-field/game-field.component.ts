import {
    Component,
    OnInit,
    Input,
    ElementRef,
    ViewChild,
    Output,
    EventEmitter,
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
    empty,
    interval,
    of,
    merge,
    timer,
    fromEvent,
    Subject,
    combineLatest,
    race,
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
import * as Logic from 'iq180-logic';
import { Player } from 'src/app/core/models/player.model';
import { DragAndDropService } from './drag-and-drop.service';
import { isNumber, isOperator } from 'src/app/core/functions/predicates';
import { NzModalService } from 'ng-zorro-antd';

@Component({
    selector: 'app-game-field',
    templateUrl: './game-field.component.html',
    styleUrls: ['./game-field.component.scss'],
})
export class GameFieldComponent implements OnInit {
    @Input() player: Player;
    @Input() isCurrentPlayer: boolean;

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

    generateQuestion = this.dndService.generateQuestion;
    reset = this.dndService.reset;

    operators = this.dndService.operators;

    @ViewChild('main', { static: true }) main: ElementRef;

    timer$: Observable<number>;
    isGaming$ = new BehaviorSubject<boolean>(false);

    destroy$ = new Subject();

    resetTimer$ = new Subject();

    keypress$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
        takeUntil(this.destroy$),
        pluck('key'),
    );

    constructor(
        private dndService: DragAndDropService,
        private modalService: NzModalService,
    ) {}

    skip() {
        this.resetTimer$.next();
        this.dndService.skip();
    }
    ngOnInit() {
        this.keypress$
            .pipe(
                withLatestFrom(this.numbers$, this.answer$, this.isGaming$),
                filter(([, , , isGaming]) => isGaming),
            )
            .subscribe(args => this.handleKeypress(args));
        this.dndService.skip();
        this.startGame();
    }

    handleKeypress([key, numbers, answers]: [
        string,
        NumberCard[],
        DraggableCard[],
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
        );
    }

    /* Drag and Drop Stuff */
    startGame() {
        const future = new Date().valueOf() + 1000;
        this.createTimer(new Date(future));

        this.isGaming$.next(true);

        this.resetTimer$
            .pipe(
                startWith(undefined),
                switchMap(() => {
                    return race(
                        this.timer$.pipe(
                            filter(v => v === 0),
                            mapTo('TIMER_END'),
                        ),
                        combineLatest([
                            this.currentAnswer$,
                            this.expectedAnswer$,
                        ]).pipe(
                            filter(([cA, eA]) => cA === eA),
                            mapTo('CORRECT_ANSWER'),
                        ),
                    ).pipe(withLatestFrom(this.timer$));
                }),
                takeWhile(() => this.isGaming$.value),
            )
            .subscribe(([res, timeLeft]) => {
                if (res === 'CORRECT_ANSWER') {
                    this.modalService.success({
                        nzTitle: 'You win !',
                        nzContent: `It took you ${60 -
                            timeLeft} seconds for you to solve this`,
                        nzCancelText: 'Exit Game',
                        nzOnOk: () => this.skip(),
                        nzOnCancel: () => this.endGame(),
                        nzKeyboard: false,
                    });
                } else {
                    this.modalService.error({
                        nzTitle: 'You Lose !',
                        nzContent: 'Some Discouraging message',
                        nzCancelText: 'Exit Game',
                        nzOnOk: () => this.skip(),
                        nzOnCancel: () => this.endGame(),
                        nzKeyboard: false,
                    });
                }
            });
    }

    endGame() {
        this.exit.emit();
        this.isGaming$.next(false);
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

    vibrate() {
        navigator.vibrate(200);
    }
}
