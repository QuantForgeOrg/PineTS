(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);
    array.push(arr1, 30);
    array.push(arr1, 40);

    const arr2 = array.new(0);
    array.push(arr2, 100);
    array.push(arr2, 200);
    array.push(arr2, 300);

    const variance1 = array.variance(arr1);
    const variance2 = array.variance(arr2);
    
    plotchar(variance1, '_plotchar');
    plot(variance2, '_plot');

    return {
        variance1,
        variance2,
    };
};
