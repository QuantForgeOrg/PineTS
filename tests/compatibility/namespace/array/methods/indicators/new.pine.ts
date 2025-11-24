(context) => {
            const { close, open } = context.data;
            const array = context.array;
            const { plot, plotchar } = context.core;

        const arr1 = array.new(5, 10);
        const arr2 = array.new(3, 20);

        const size1 = array.size(arr1);
        const size2 = array.size(arr2);
        
        plotchar(size1, '_plotchar');
        plot(size2, '_plot');

        const new_native = arr1.array;
        const new_var = arr2.array;

            return {
                new_native,
                new_var,
            };
};
