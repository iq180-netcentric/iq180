import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
    NumberCard,
    DraggableCard,
    CardType,
    OperatorCard,
} from 'src/app/core/models/game/card.model';
import { debounceTime, startWith, share, filter, map } from 'rxjs/operators';
import * as Logic from 'iq180-logic';
import {
    CdkDragDrop,
    moveItemInArray,
    transferArrayItem,
} from '@angular/cdk/drag-drop';

@Injectable({
    providedIn: 'root',
})
export class DragAndDropService {
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
                operators: ['+', '-', '*', '/', '(', ')'],
            });
        }),
        startWith(true),
    );

    currentAnswer$ = this.answer$.pipe(
        filter(ans => ans.length >= 1),
        map(ans => {
            if (
                Logic.validateForDisplay({
                    array: ans.map(e => e.value),
                    operators: ['+', '-', '*', '/', '(', ')'],
                })
            ) {
                return Logic.calculate(ans.map(e => e.value));
            } else {
                return 'Invalid';
            }
        }, share()),
    );

    operators$ = this.answer$.pipe(
        map(ans => ans.filter(e => e.type === CardType.operator)),
    );

    operators: OperatorCard[] = [
        { value: '+', display: '+', disabled: false },
        { value: '-', display: '-', disabled: false },
        { value: '*', display: 'x', disabled: false },
        { value: '/', display: '÷', disabled: false },
        { value: '(', display: '(', disabled: false },
        { value: ')', display: ')', disabled: false },
    ].map(e => ({ ...e, type: CardType.operator }));

    constructor() {}

    reset() {
        const { question, operators, expectedAnswer } = Logic.generate({
            numberLength: 5,
            operators: ['+', '-', '*', '/', , '(', ')'],
            integerAnswer: true,
        });
        this.operators = [
            { value: '+', display: '+', disabled: false },
            { value: '-', display: '-', disabled: false },
            { value: '*', display: 'x', disabled: false },
            { value: '/', display: '÷', disabled: false },
            { value: '(', display: '(', disabled: false },
            { value: ')', display: ')', disabled: false },
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
        ansArr.splice(ansIdx !== undefined ? ansIdx : ansArr.length, 0, card);
        this.answer$.next(ansArr);
    }
}
