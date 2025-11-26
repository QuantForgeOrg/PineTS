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

    const last1 = array.last(arr1);
    const last2 = array.last(arr2);

    plotchar(last1, '_plotchar');
    plot(last2, '_plot');

    return {
        last1,
        last2,
    };
};
