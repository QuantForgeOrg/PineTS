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

    const stdev1 = array.stdev(arr1);
    const stdev2 = array.stdev(arr2);
    
    plotchar(stdev1, '_plotchar');
    plot(stdev2, '_plot');

    return {
        stdev1,
        stdev2,
    };
};
