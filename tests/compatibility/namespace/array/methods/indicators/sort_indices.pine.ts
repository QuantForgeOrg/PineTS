(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const result1 = array.sort_indices(arr1);
                const result2 = array.sort_indices(arr2);
            
                plotchar(result1, '_plotchar');
                plot(result2, '_plot');
            
                const sort_indices_native = result1.array;
                const sort_indices_var = result2.array;
            
                return {
                    sort_indices_native,
                    sort_indices_var,
                };
};
