(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(5, 100);
    const arr2 = array.new(3, 200);

    const size1 = array.size(arr1);
    const size2 = array.size(arr2);

    plotchar(size1, '_plotchar');
    plot(size2, '_plot');

    const new_value1 = array.get(arr1, 0);
    const new_value2 = array.get(arr2, 2);

    return {
        new_value1,
        new_value2,
    };
};
