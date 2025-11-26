(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);

    const arr2 = array.new(0);
    array.push(arr2, 30);
    array.push(arr2, 40);

    const concatenated = array.concat(arr1, arr2);

    const val1 = array.get(concatenated, 0);
    const val2 = array.get(concatenated, 2);

    plotchar(val1, '_plotchar');
    plot(val2, '_plot');

    const concat_size = array.size(concatenated);
    const concat_last = array.last(concatenated);

    return {
        concat_size,
        concat_last,
        val1,
        val2,
    };
};
