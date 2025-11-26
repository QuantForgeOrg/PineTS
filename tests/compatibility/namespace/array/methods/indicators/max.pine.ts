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

    const max1 = array.max(arr1);
    const max2 = array.max(arr2);
    
    plotchar(max1, '_plotchar');
    plot(max2, '_plot');

    return {
        max1,
        max2,
    };
};
