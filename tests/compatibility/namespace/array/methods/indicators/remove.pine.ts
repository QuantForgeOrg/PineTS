(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);
    array.push(arr1, 30);
    const removed1 = array.remove(arr1, 1);

    const arr2 = array.new(0);
    array.push(arr2, 100);
    array.push(arr2, 200);
    array.push(arr2, 300);
    const removed2 = array.remove(arr2, 0);

    const size1 = array.size(arr1);
    const size2 = array.size(arr2);

    plotchar(removed1, '_plotchar');
    plot(removed2, '_plot');

    return {
        removed1,
        removed2,
        size1,
        size2,
    };
};
