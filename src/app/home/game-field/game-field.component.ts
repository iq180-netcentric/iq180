import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
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
    timer,
    fromEvent,
    Subject,
    combineLatest,
} from 'rxjs';
import {
    transferArrayItem,
    moveItemInArray,
    CdkDragDrop,
    CdkDrag,
    CdkDropList,
    CdkDragEnd,
} from '@angular/cdk/drag-drop';
import {
    startWith,
    delay,
    switchMap,
    tap,
    take,
    map,
    endWith,
    filter,
    debounce,
    debounceTime,
    share,
    takeUntil,
    pluck,
    withLatestFrom,
} from 'rxjs/operators';
import * as Logic from 'iq180-logic';
import { Player } from 'src/app/core/models/player.model';
import { DragAndDropService } from './drag-and-drop.service';
import { isNumber, isOperator } from 'src/app/core/functions/predicates';

@Component({
    selector: 'app-game-field',
    templateUrl: './game-field.component.html',
    styleUrls: ['./game-field.component.scss'],
})
export class GameFieldComponent implements OnInit {
    @Input() player: Player;

    // Game Data
    numbers$ = this.dndService.numbers$;
    answer$ = this.dndService.answer$;
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
    reset = this.dndService.reset;

    operators = this.dndService.operators;

    @ViewChild('main', { static: true }) main: ElementRef;

    timer$: Observable<number>;
    isGaming$ = new BehaviorSubject<boolean>(false);

    destroy$ = new Subject();

    keypress$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
        takeUntil(this.destroy$),
        pluck('key'),
    );

    constructor(private dndService: DragAndDropService) {}

    ngOnInit() {
        this.keypress$
            .pipe(
                withLatestFrom(this.numbers$, this.answer$, this.isGaming$),
                filter(([, , , isGaming]) => isGaming),
            )
            .subscribe(([key, numbers, answers]) => {
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
            });
        this.dndService.reset();
        this.startGame();
    }

    createTimer(startTime: Date) {
        this.timer$ = timer(startTime, 1000).pipe(
            take(61),
            map(t => 60 - t),
            startWith(0),
        );
    }

    /* Drag and Drop Stuff */
    startGame() {
        const future = new Date().valueOf() + 1000;
        this.createTimer(new Date(future));
        this.timer$.subscribe(
            time => {
                this.isGaming$.next(true);
            },
            () => null,
            () => {
                this.isGaming$.next(false);
            },
        );
    }

    onDragEnded(event: CdkDragEnd) {
        event.source.element.nativeElement.style.transform = 'none'; // visually reset element to its origin
        const source: any = event.source;
        source._passiveTransform = { x: 0, y: 0 }; // make it so new drag starts from same origin
    }

    handleKeypress(event: KeyboardEvent) {
        console.log(event);
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
