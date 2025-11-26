(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 0);
    array.push(arr1, 1);
    array.push(arr1, 2);
    array.push(arr1, 3);
    array.push(arr1, 4);

    const arr2 = array.new(0);
    array.push(arr2, 10);
    array.push(arr2, 12);
    array.push(arr2, 14);
    array.push(arr2, 16);
    array.push(arr2, 18);

    const val1 = array.get(arr1, 2);
    const val2 = array.get(arr2, 3);

    plotchar(val1, '_plotchar');
    plot(val2, '_plot');

    const range_sum1 = array.sum(arr1);
    const range_sum2 = array.sum(arr2);

    return {
        range_sum1,
        range_sum2,
    };
};
