(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);
    array.push(arr1, 30);

    const every1 = array.every(arr1, (val) => val > 5);
    const every2 = array.every(arr1, (val) => val > 15);
    
    plotchar(every1, '_plotchar');
    plot(every2, '_plot');

    const arr2 = array.new(0);
    array.push(arr2, 100);
    array.push(arr2, 200);
    array.push(arr2, 300);

    const every3 = array.every(arr2, (val) => val > 50);

    return {
        every1,
        every2,
        every3,
    };
};
