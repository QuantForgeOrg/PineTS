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

    const avg1 = array.avg(arr1);
    const avg2 = array.avg(arr2);
    
    plotchar(avg1, '_plotchar');
    plot(avg2, '_plot');

    return {
        avg1,
        avg2,
    };
};
