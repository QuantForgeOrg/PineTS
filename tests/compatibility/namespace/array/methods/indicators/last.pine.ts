(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const last_native = array.last(arr1);
                const last_var = array.last(arr2);
            
                plotchar(last_native, '_plotchar');
                plot(last_var, '_plot');
            
                return {
                    last_native,
                    last_var,
                };
};
