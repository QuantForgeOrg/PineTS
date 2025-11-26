(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 30);
    array.insert(arr1, 1, 20);

    const arr2 = array.new(0);
    array.push(arr2, 100);
    array.push(arr2, 300);
    array.insert(arr2, 1, 200);

    const size1 = array.size(arr1);
    const size2 = array.size(arr2);

    plotchar(size1, '_plotchar');
    plot(size2, '_plot');

    const insert_middle1 = array.get(arr1, 1);
    const insert_middle2 = array.get(arr2, 1);

    return {
        insert_middle1,
        insert_middle2,
    };
};
