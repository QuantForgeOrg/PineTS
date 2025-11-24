(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const max_native = array.max(arr1);
                const max_var = array.max(arr2);
            
                plotchar(max_native, '_plotchar');
                plot(max_var, '_plot');
            
                return {
                    max_native,
                    max_var,
                };
};
