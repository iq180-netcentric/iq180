type NumOrStr = number | string;

/**
 * Function validateForDisplay
 * performs validation of the array given the conditions
 * for showing the results of the expressions only
 * @param array Array to validate
 * @param operators Array of string of operators
 */
export const validateForDisplay = ({
    array,
    operators,
}: {
    array: NumOrStr[];
    operators: string[];
}) => {
    return (
        array.length === 0 ||
        (array.length % 2 === 1 &&
            array.every(
                (v, i) =>
                    (i % 2 == 0 && typeof v === 'number') ||
                    (i % 2 == 1 && operators.includes(v.toString())),
            ))
    );
};

/**
 * Function validateForSubmission
 * performs validation of the array given the conditions, including the length of question
 * in order to submit the answer
 * @param array Array to validate
 * @param numberLength Number of numbers in the question
 * @param operators Array of string of operators
 */
export const validateForSubmission = ({
    array,
    numberLength,
    operators,
}: {
    array: NumOrStr[];
    numberLength: number;
    operators: string[];
}) => {
    return (
        array.length == 2 * numberLength - 1 &&
        validateForDisplay({ array, operators })
    );
};

/**
 * Function calculate
 * performs calculation over the array using the PEMDAS
 * this is done to avoid using eval() function as it is very dangerous and very not cool UwU
 * @param array Array of expressions that contain numbers and strings
 */

export const calculate = (array: NumOrStr[]) => {
    // loops over an array to calculate exponents
    const copyArray = [...array];
    for (let i = copyArray.length - 2; i > 0; i -= 2) {
        if (copyArray[i] == '**') {
            copyArray[i] =
                (copyArray[i - 1] as number) ** (copyArray[i + 1] as number);
            copyArray.splice(i + 1, 1);
            copyArray.splice(i - 1, 1);
        }
    }
    // loops over an array to calculate multiply and divide
    for (let i = 1; i < copyArray.length; i += 2) {
        if (copyArray[i] == '*') {
            // if encountered an operation
            // perform that operation on the number before and after operator
            // and replace the results on the operator
            copyArray[i] =
                (copyArray[i - 1] as number) * (copyArray[i + 1] as number);
            // then remove the numbers on the left and right
            copyArray.splice(i + 1, 1);
            copyArray.splice(i - 1, 1);
            // and shift the iterator back by 2
            i -= 2;
        }
        if (copyArray[i] == '/') {
            copyArray[i] =
                (copyArray[i - 1] as number) / (copyArray[i + 1] as number);
            copyArray.splice(i + 1, 1);
            copyArray.splice(i - 1, 1);
            i -= 2;
        }
    }
    // loops over an array to calculate add and subtract
    for (let i = 1; i < copyArray.length; i += 2) {
        if (copyArray[i] == '+') {
            copyArray[i] =
                (copyArray[i - 1] as number) + (copyArray[i + 1] as number);
            copyArray.splice(i + 1, 1);
            copyArray.splice(i - 1, 1);
            i -= 2;
        }
        if (copyArray[i] == '-') {
            copyArray[i] =
                (copyArray[i - 1] as number) - (copyArray[i + 1] as number);
            copyArray.splice(i + 1, 1);
            copyArray.splice(i - 1, 1);
            i -= 2;
        }
    }
    // return the result of the final remaining number
    return copyArray[0] as number;
};

/**
 * Question, expected answer and solution generator
 * @param numberLength Number of numbers in the question
 * @param operators Array of string of operators
 * @param integerAnswer Boolean to set whether the answer must be integer or not
 */

export const generate = ({
    numberLength = 5,
    operators = ['+', '-', '*', '/'],
    integerAnswer = true,
}: {
    numberLength: number;
    operators: string[];
    integerAnswer: boolean;
}): {
    question: number[];
    operators: string[];
    expectedAnswer: number;
    solution: NumOrStr[];
} => {
    let expression: NumOrStr[] = null;
    let numbers: number[] = null;
    let operations: string[] = null;
    let expectedAnswer: number = null;
    // check if the expression is generated and finite (not Infinity or NaN)
    while (
        !(
            expression !== null &&
            isFinite(expectedAnswer) &&
            (!integerAnswer || Math.floor(expectedAnswer) === expectedAnswer)
        ) // if integerAnswer is true, check whether the expectedAnswer is integer
    ) {
        // generate random numbers from 1 to 9, into an array of numberLength numbers
        // example: [4, 2, 6, 9, 2]
        numbers = Array.from({ length: numberLength }, () =>
            Math.floor(Math.random() * 9 + 1),
        );

        // generate random operations from OPERATORS, into an array of numberLength-1 operators
        // example: ['+', '-', '/', '*']
        operations = Array.from(
            { length: numberLength - 1 },
            () => operators[Math.floor(Math.random() * operators.length)],
        );

        // join numbers and operations into an array of numbers and operations
        // example: [4, '+', 2, '-', 6, '/', 9, '*', 2]
        expression = [].concat(...numbers.map((v, i) => [v, operations[i]])); // returns [4, '+', 2, '-', 6, '/', 9, '*', 2, undefined]
        expression.pop(); // remove undefined element

        expectedAnswer = calculate(expression);
    }
    return {
        question: numbers,
        operators: operators,
        expectedAnswer: expectedAnswer,
        solution: expression,
    };
};
