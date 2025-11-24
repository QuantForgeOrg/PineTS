(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const result1 = array.copy(arr1);
                const result2 = array.copy(arr2);
            
                plotchar(result1, '_plotchar');
                plot(result2, '_plot');
            
                const copy_native = result1.array;
                const copy_var = result2.array;
            
                return {
                    copy_native,
                    copy_var,
                };
};
