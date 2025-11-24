(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);
    array.push(arr1, 30);
    array.push(arr1, 40);
    array.push(arr1, 50);

    const sliced1 = array.slice(arr1, 1, 4);
    const sliced2 = array.slice(arr1, 0, 2);

    const val1 = array.get(sliced1, 0);
    const val2 = array.get(sliced2, 0);

    plotchar(val1, '_plotchar');
    plot(val2, '_plot');

    const slice_size1 = array.size(sliced1);
    const slice_size2 = array.size(sliced2);

    return {
        slice_size1,
        slice_size2,
        val1,
        val2,
    };
};
