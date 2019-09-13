import { Component, OnInit, Input } from '@angular/core';
import {
    OperatorCard,
    DraggableCard,
    NumberCard,
    CardType,
} from 'src/app/core/models/game/card.model';
import { BehaviorSubject, Observable, empty, interval, of } from 'rxjs';
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
} from 'rxjs/operators';
import * as Logic from 'iq180-logic';
import { Player } from 'src/app/core/models/player.model';

@Component({
    selector: 'app-game-field',
    templateUrl: './game-field.component.html',
    styleUrls: ['./game-field.component.scss'],
})
export class GameFieldComponent implements OnInit {
    @Input() player: Player;

    numbers$ = new BehaviorSubject<NumberCard[]>([]);
    answer$ = new BehaviorSubject<DraggableCard[]>([]);
    expectedAnswer$ = new BehaviorSubject<number>(null);
    wrongPositions$ = this.answer$.pipe(
        filter(answer => !!answer),
        debounceTime(750),
        map(answer => answer.map(e => e.value)),
        map(answers => Logic.highlightWrongLocation({ array: answers })),
    );

    isValidAnswer$ = this.answer$.pipe(
        debounceTime(750),
        map(ans => {
            return Logic.validateForDisplay({
                array: ans.map(e => e.value),
                operators: ['+', '-', '*', '/'],
            });
        }),
        startWith(true),
    );

    currentAnswer$ = this.answer$.pipe(
        debounceTime(750),
        map(ans => {
            if (
                Logic.validateForDisplay({
                    array: ans.map(e => e.value),
                    operators: ['+', '-', '*', '/'],
                })
            ) {
                return Logic.calculate(ans.map(e => e.value));
            } else {
                return 'Invalid';
            }
        }, share()),
    );

    operators: OperatorCard[] = [
        { value: '+', display: '+', disabled: false },
        { value: '-', display: '-', disabled: false },
        { value: 'x', display: 'x', disabled: false },
        { value: '÷', display: '÷', disabled: false },
    ].map(e => ({ ...e, type: CardType.operator }));
    operators$ = this.answer$.pipe(
        map(ans => ans.filter(e => e.type === CardType.operator)),
    );

    timer$: Observable<number>;
    gaming$ = new BehaviorSubject<boolean>(false);

    constructor() {}

    ngOnInit() {
        this.reset();
        this.startGame();
    }

    createTimer(startTime: Date) {
        const delayMS = startTime.valueOf() - new Date().valueOf();
        this.timer$ = of(new Date()).pipe(
            delay(delayMS),
            switchMap(() => interval(1000)),
            take(61),
            map(t => 60 - t),
        );
    }
    /* Drag and Drop Stuff */
    startGame() {
        const future = new Date().valueOf() + 2000;
        this.createTimer(new Date(future));
        this.timer$.subscribe(
            time => {
                this.gaming$.next(true);
            },
            () => null,
            () => {
                this.gaming$.next(false);
            },
        );
    }

    reset() {
        const { question, operators, expectedAnswer } = Logic.generate({
            numberLength: 5,
            operators: ['+', '-', '*', '/'],
            integerAnswer: true,
        });
        this.operators = [
            { value: '+', display: '+', disabled: false },
            { value: '-', display: '-', disabled: false },
            { value: '*', display: 'x', disabled: false },
            { value: '/', display: '÷', disabled: false },
        ].map(e => ({ ...e, type: CardType.operator }));
        this.numbers$.next(
            question
                .map(e => ({
                    value: e,
                    display: e.toString(),
                    disabled: false,
                }))
                .map(e => ({ ...e, type: CardType.number })),
        );
        this.expectedAnswer$.next(expectedAnswer);
        this.answer$.next([]);
    }
    dropAnswer(event: CdkDragDrop<DraggableCard[]>) {
        if (event.previousContainer === event.container) {
            const arr = this.answer$.getValue();
            moveItemInArray(arr, event.previousIndex, event.currentIndex);
            this.answer$.next(arr);
        } else {
            const card = event.previousContainer.data[event.previousIndex];
            if (card.type === CardType.number) {
                this.addNumber(
                    card as NumberCard,
                    event.previousIndex,
                    event.currentIndex,
                );
            } else if (card.type === CardType.operator) {
                this.addOperator(
                    card as OperatorCard,
                    event.previousIndex,
                    event.currentIndex,
                );
            }
        }
    }

    dropNumber(event: CdkDragDrop<DraggableCard[]>) {
        if (event.previousContainer === event.container) {
            const arr = this.numbers$.getValue();
            moveItemInArray(arr, event.previousIndex, event.currentIndex);
            this.numbers$.next(arr);
        } else {
            const card = event.previousContainer.data[event.previousIndex];
            if (card.type === CardType.number) {
                this.removeNumber(event.previousIndex, event.currentIndex);
            }
        }
    }

    dropOperator(event: CdkDragDrop<DraggableCard[]>) {
        if (event.previousContainer === event.container) {
            const arr = this.operators;
            moveItemInArray(arr, event.previousIndex, event.currentIndex);
        } else {
            const card = event.previousContainer.data[event.previousIndex];
            if (card.type === CardType.operator) {
                const ansArr = this.answer$.getValue();
                ansArr.splice(event.previousIndex, 1);
                this.answer$.next(ansArr);
            }
        }
    }

    removeNumber(fromIdx: number, toIdx?: number) {
        const ans = this.answer$.getValue();
        const dst = this.numbers$.getValue();
        transferArrayItem(ans, dst, fromIdx, toIdx || dst.length);
        this.numbers$.next(dst);
        this.answer$.next(ans);
    }

    removeOperator(card: OperatorCard, idx: number) {
        const ansArr = this.answer$.getValue();
        ansArr.splice(idx, 1);
        this.answer$.next(ansArr);
    }

    removeCard(card: DraggableCard, idx: number) {
        if (card.type === CardType.number) {
            this.removeNumber(idx);
        } else {
            this.removeOperator(card as OperatorCard, idx);
        }
    }

    addNumber(card: NumberCard, numIdx: number, ansIdx?: number) {
        const ansArr = this.answer$.getValue();
        ansArr.splice(ansIdx !== undefined ? ansIdx : ansArr.length, 0, card);
        this.answer$.next(ansArr);
        const numArr = this.numbers$.getValue();
        numArr.splice(numIdx, 1);
        this.numbers$.next(numArr);
    }

    addOperator(card: OperatorCard, opIdx: number, ansIdx?: number) {
        const ansArr = this.answer$.getValue();
        if (ansArr.filter(e => e.type === CardType.operator).length < 4) {
            ansArr.splice(
                ansIdx !== undefined ? ansIdx : ansArr.length,
                0,
                card,
            );
            this.answer$.next(ansArr);
        }
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
