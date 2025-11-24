(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const every_native = array.every(arr1, (x) => x > 0);
                const every_var = array.every(arr2, (x) => x < 1000);
            
                plotchar(every_native, '_plotchar');
                plot(every_var, '_plot');
            
                return {
                    every_native,
                    every_var,
                };
};
