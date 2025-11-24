(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const variance_native = array.variance(arr1);
                const variance_var = array.variance(arr2);
            
                plotchar(variance_native, '_plotchar');
                plot(variance_var, '_plot');
            
                return {
                    variance_native,
                    variance_var,
                };
};
