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

    const first1 = array.first(arr1);
    const first2 = array.first(arr2);

    plotchar(first1, '_plotchar');
    plot(first2, '_plot');

    return {
        first1,
        first2,
    };
};
