(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);
    array.push(arr1, 30);

    const includes1 = array.includes(arr1, 20);
    const includes2 = array.includes(arr1, 999);

    plotchar(includes1, '_plotchar');
    plot(includes2, '_plot');

    const arr2 = array.new(0);
    array.push(arr2, 100);
    array.push(arr2, 200);

    const includes3 = array.includes(arr2, 100);

    return {
        includes1,
        includes2,
        includes3,
    };
};
