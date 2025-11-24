(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const first_native = array.first(arr1);
                const first_var = array.first(arr2);
            
                plotchar(first_native, '_plotchar');
                plot(first_var, '_plot');
            
                return {
                    first_native,
                    first_var,
                };
};
