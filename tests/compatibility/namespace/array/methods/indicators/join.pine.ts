(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const join_native = array.join(arr1, ",");
                const join_var = array.join(arr2, "|");
            
                plotchar(join_native, '_plotchar');
                plot(join_var, '_plot');
            
                return {
                    join_native,
                    join_var,
                };
};
