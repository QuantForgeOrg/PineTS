(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);
    array.push(arr1, 30);

    const some1 = array.some(arr1, (val) => val > 25);
    const some2 = array.some(arr1, (val) => val > 50);
    
    plotchar(some1, '_plotchar');
    plot(some2, '_plot');

    const arr2 = array.new(0);
    array.push(arr2, 100);
    array.push(arr2, 200);
    array.push(arr2, 300);

    const some3 = array.some(arr2, (val) => val < 150);

    return {
        some1,
        some2,
        some3,
    };
};
