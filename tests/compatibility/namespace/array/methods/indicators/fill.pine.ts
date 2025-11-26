(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(5, 10);
    const arr2 = array.new(4, 20);

    array.fill(arr1, 99);
    array.fill(arr2, 88);

    const val1 = array.get(arr1, 2);
    const val2 = array.get(arr2, 3);

    plotchar(val1, '_plotchar');
    plot(val2, '_plot');

    const fill_first = array.get(arr1, 0);
    const fill_last = array.get(arr2, 3);

    return {
        fill_first,
        fill_last,
    };
};
