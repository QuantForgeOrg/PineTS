(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(5, 0);
    array.set(arr1, 0, 100);
    array.set(arr1, 1, 200);
    array.set(arr1, 2, 300);
    array.set(arr1, 3, 400);
    array.set(arr1, 4, 500);

    const get_first = array.get(arr1, 0);
    const get_middle = array.get(arr1, 2);
    const get_last = array.get(arr1, 4);

    plotchar(get_first, '_plotchar');
    plot(get_last, '_plot');

    return {
        get_first,
        get_middle,
        get_last,
    };
};
