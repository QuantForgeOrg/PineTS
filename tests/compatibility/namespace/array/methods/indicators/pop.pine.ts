(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);
    array.push(arr1, 30);

    const popped1 = array.pop(arr1);
    const size_after1 = array.size(arr1);

    const arr2 = array.new(0);
    array.push(arr2, 100);
    array.push(arr2, 200);

    const popped2 = array.pop(arr2);
    const size_after2 = array.size(arr2);

    plotchar(popped1, '_plotchar');
    plot(popped2, '_plot');

    return {
        popped1,
        popped2,
        size_after1,
        size_after2,
    };
};
