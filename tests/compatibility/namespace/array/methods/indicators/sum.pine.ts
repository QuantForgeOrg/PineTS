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
    array.push(arr2, 300);
    array.push(arr2, 400);

    const sum1 = array.sum(arr1);
    const sum2 = array.sum(arr2);
    
    plotchar(sum1, '_plotchar');
    plot(sum2, '_plot');

    return {
        sum1,
        sum2,
    };
};
