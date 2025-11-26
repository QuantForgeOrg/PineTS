(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 50);
    array.push(arr1, 30);

    const arr2 = array.new(0);
    array.push(arr2, 100);
    array.push(arr2, 200);
    array.push(arr2, 150);
    array.push(arr2, 250);

    const min1 = array.min(arr1);
    const min2 = array.min(arr2);
    
    plotchar(min1, '_plotchar');
    plot(min2, '_plot');

    return {
        min1,
        min2,
    };
};
