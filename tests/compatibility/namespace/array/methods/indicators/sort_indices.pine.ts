(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 40);
    array.push(arr1, 10);
    array.push(arr1, 30);
    array.push(arr1, 20);

    const arr2 = array.new(0);
    array.push(arr2, 5);
    array.push(arr2, 3);
    array.push(arr2, 8);

    const val1 = array.get(arr1, 0);
    const val2 = array.get(arr2, 0);
    
    plotchar(val1, '_plotchar');
    plot(val2, '_plot');

    const min1 = array.min(arr1);
    const max2 = array.max(arr2);

    return {
        min1,
        max2,
    };
};
