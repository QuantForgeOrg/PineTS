(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const avg_native = array.avg(arr1);
                const avg_var = array.avg(arr2);
            
                plotchar(avg_native, '_plotchar');
                plot(avg_var, '_plot');
            
                return {
                    avg_native,
                    avg_var,
                };
};
