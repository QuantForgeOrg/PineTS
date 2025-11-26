(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);
    array.push(arr1, 30);
    array.push(arr1, 20);

    const index1 = array.indexof(arr1, 20);
    const index2 = array.indexof(arr1, 999);

    plotchar(index1, '_plotchar');
    plot(index2, '_plot');

    const arr2 = array.new(0);
    array.push(arr2, 100);
    array.push(arr2, 200);

    const index3 = array.indexof(arr2, 100);

    return {
        index1,
        index2,
        index3,
    };
};
