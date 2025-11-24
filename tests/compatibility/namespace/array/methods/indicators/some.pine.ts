(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const some_native = array.some(arr1, (x) => x > 50);
                const some_var = array.some(arr2, (x) => x < 50);
            
                plotchar(some_native, '_plotchar');
                plot(some_var, '_plot');
            
                return {
                    some_native,
                    some_var,
                };
};
