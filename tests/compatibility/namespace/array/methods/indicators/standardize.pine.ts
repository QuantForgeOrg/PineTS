(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);
    array.push(arr1, 30);
    array.push(arr1, 40);

    const arr2 = array.new(0);
    array.push(arr2, 100);
    array.push(arr2, 200);
    array.push(arr2, 300);

    const std1 = array.standardize(arr1);
    const std2 = array.standardize(arr2);

    const val1 = array.get(std1, 0);
    const val2 = array.get(std2, 0);
    
    plotchar(val1, '_plotchar');
    plot(val2, '_plot');

    const std_first1 = array.get(std1, 0);
    const std_first2 = array.get(std2, 0);

    return {
        std_first1,
        std_first2,
    };
};
