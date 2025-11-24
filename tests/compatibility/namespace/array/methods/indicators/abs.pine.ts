(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const math = context.math;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(3, -10);
    array.set(arr1, 1, -20);
    array.set(arr1, 2, -30);
    const arr2 = array.new(5, -20);
    array.set(arr2, 1, -20);
    array.set(arr2, 2, -30);
    array.set(arr2, 3, -40);
    array.set(arr2, 4, -50);

    const result1 = array.abs(arr1);
    const result2 = array.abs(arr2);

    const val1 = array.get(result1, 0);
    const val2 = array.get(result2, 0);

    plotchar(val1, '_plotchar');
    plot(val2, '_plot');

    const abs_native = array.get(result1, 2);
    const abs_var = array.get(result2, 3);

    return {
        abs_native,
        abs_var,
    };
};
