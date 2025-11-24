(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);
    array.push(arr1, 30);

    const arr2 = array.new(0);
    array.push(arr2, 5);
    array.push(arr2, 15);
    array.push(arr2, 25);

    const cov1 = array.covariance(arr1, arr2);
    
    plotchar(cov1, '_plotchar');
    plot(cov1, '_plot');

    const arr3 = array.new(0);
    array.push(arr3, 100);
    array.push(arr3, 200);

    const arr4 = array.new(0);
    array.push(arr4, 50);
    array.push(arr4, 150);

    const cov2 = array.covariance(arr3, arr4);

    return {
        cov1,
        cov2,
    };
};
