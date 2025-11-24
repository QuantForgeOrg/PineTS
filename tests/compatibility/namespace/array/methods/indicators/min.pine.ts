(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const min_native = array.min(arr1);
                const min_var = array.min(arr2);
            
                plotchar(min_native, '_plotchar');
                plot(min_var, '_plot');
            
                return {
                    min_native,
                    min_var,
                };
};
