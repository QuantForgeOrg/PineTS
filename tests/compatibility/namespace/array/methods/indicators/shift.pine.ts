(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);
    array.push(arr1, 30);

    const shifted1 = array.shift(arr1);
    const size_after1 = array.size(arr1);

    const arr2 = array.new(0);
    array.push(arr2, 100);
    array.push(arr2, 200);

    const shifted2 = array.shift(arr2);
    const size_after2 = array.size(arr2);

    plotchar(shifted1, '_plotchar');
    plot(shifted2, '_plot');

    return {
        shifted1,
        shifted2,
        size_after1,
        size_after2,
    };
};
