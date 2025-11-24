(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const stdev_native = array.stdev(arr1);
                const stdev_var = array.stdev(arr2);
            
                plotchar(stdev_native, '_plotchar');
                plot(stdev_var, '_plot');
            
                return {
                    stdev_native,
                    stdev_var,
                };
};
