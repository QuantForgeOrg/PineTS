(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const indexof_native = array.indexof(arr1, 10);
                const indexof_var = array.indexof(arr2, 20);
            
                plotchar(indexof_native, '_plotchar');
                plot(indexof_var, '_plot');
            
                return {
                    indexof_native,
                    indexof_var,
                };
};
