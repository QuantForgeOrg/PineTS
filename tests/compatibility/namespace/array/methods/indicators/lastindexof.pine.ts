(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const lastindexof_native = array.lastindexof(arr1, 10);
                const lastindexof_var = array.lastindexof(arr2, 20);
            
                plotchar(lastindexof_native, '_plotchar');
                plot(lastindexof_var, '_plot');
            
                return {
                    lastindexof_native,
                    lastindexof_var,
                };
};
