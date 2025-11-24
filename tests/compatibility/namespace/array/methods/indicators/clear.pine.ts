(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);
    array.push(arr1, 30);
    const size_before1 = array.size(arr1);
    array.clear(arr1);
    const size_after1 = array.size(arr1);

    const arr2 = array.new(0);
    array.push(arr2, 100);
    array.push(arr2, 200);
    const size_before2 = array.size(arr2);
    array.clear(arr2);
    const size_after2 = array.size(arr2);

    plotchar(size_before1, '_plotchar');
    plot(size_before2, '_plot');

    return {
        size_after1,
        size_after2,
    };
};
