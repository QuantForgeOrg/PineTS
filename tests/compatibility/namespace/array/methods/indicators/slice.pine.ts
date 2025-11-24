(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const result1 = array.slice(arr1, 0, 2);
                const result2 = array.slice(arr2, 1, 3);
            
                plotchar(result1, '_plotchar');
                plot(result2, '_plot');
            
                const slice_native = result1.array;
                const slice_var = result2.array;
            
                return {
                    slice_native,
                    slice_var,
                };
};
