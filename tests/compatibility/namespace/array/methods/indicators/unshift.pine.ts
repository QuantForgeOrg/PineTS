(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 20);
    array.push(arr1, 30);
    array.unshift(arr1, 10);

    const arr2 = array.new(0);
    array.push(arr2, 200);
    array.unshift(arr2, 100);

    const size1 = array.size(arr1);
    const size2 = array.size(arr2);

    plotchar(size1, '_plotchar');
    plot(size2, '_plot');

    const unshift_first1 = array.get(arr1, 0);
    const unshift_first2 = array.get(arr2, 0);

    return {
        unshift_first1,
        unshift_first2,
    };
};
