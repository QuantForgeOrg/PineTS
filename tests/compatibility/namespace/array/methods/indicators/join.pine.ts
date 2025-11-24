(context) => {
    const { close, open } = context.data;
    const array = context.array;
    const { plot, plotchar } = context.core;

    const arr1 = array.new(0);
    array.push(arr1, 10);
    array.push(arr1, 20);
    array.push(arr1, 30);

    const joined1 = array.join(arr1, ',');
    const len1 = joined1.length;
    
    const arr2 = array.new(0);
    array.push(arr2, 100);
    array.push(arr2, 200);

    const joined2 = array.join(arr2, '-');
    const len2 = joined2.length;
    
    plotchar(len1, '_plotchar');
    plot(len2, '_plot');

    return {
        joined1,
        joined2,
    };
};
