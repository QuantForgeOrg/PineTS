(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(3, 0);
    array.set(arr1, 0, 10);
    array.set(arr1, 1, 20);
    array.set(arr1, 2, 30);

    const arr2 = array.copy(arr1);
    array.set(arr2, 1, 999);

    const val1 = array.get(arr1, 1);
    const val2 = array.get(arr2, 1);

    plotchar(val1, '_plotchar');
    plot(val2, '_plot');

    const copy_original = array.sum(arr1);
    const copy_modified = array.sum(arr2);

    return {
        copy_original,
        copy_modified,
    };
};
