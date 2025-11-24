(context) => {
            const { close, open } = context.data;
            const array = context.array;
            const { plot, plotchar } = context.core;

            const arr1 = array.new(5, 10);
            const arr2 = array.new(5, 20);
            
            const range_native = array.range(arr1);
            const range_var = array.range(arr2);

            plotchar(range_native, '_plotchar');
            plot(range_var, '_plot');

            return {
                range_native,
                range_var,
            };
};
