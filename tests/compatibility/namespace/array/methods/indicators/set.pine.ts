(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(5, 0);
    array.set(arr1, 0, 10);
    array.set(arr1, 2, 30);
    array.set(arr1, 4, 50);

    const val1 = array.get(arr1, 0);
    const val2 = array.get(arr1, 2);

    plotchar(val1, '_plotchar');
    plot(val2, '_plot');

    const set_first = array.get(arr1, 0);
    const set_last = array.get(arr1, 4);

    return {
        set_first,
        set_last,
    };
};
