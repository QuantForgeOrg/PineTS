(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const sum_native = array.sum(arr1);
                const sum_var = array.sum(arr2);
            
                plotchar(sum_native, '_plotchar');
                plot(sum_var, '_plot');
            
                return {
                    sum_native,
                    sum_var,
                };
};
