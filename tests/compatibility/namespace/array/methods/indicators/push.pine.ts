(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);
    array.push(arr1, 30);

    const arr2 = array.new(0);
    array.push(arr2, 100);
    array.push(arr2, 200);

    const size1 = array.size(arr1);
    const size2 = array.size(arr2);

    plotchar(size1, '_plotchar');
    plot(size2, '_plot');

    const push_last1 = array.get(arr1, 2);
    const push_last2 = array.get(arr2, 1);

    return {
        push_last1,
        push_last2,
    };
};
