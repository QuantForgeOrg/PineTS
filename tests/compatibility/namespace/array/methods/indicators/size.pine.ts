(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(5, 100);
    const arr2 = array.new(10, 200);

    const size1 = array.size(arr1);
    const size2 = array.size(arr2);

    plotchar(size1, '_plotchar');
    plot(size2, '_plot');

    return {
        size1,
        size2,
    };
};
