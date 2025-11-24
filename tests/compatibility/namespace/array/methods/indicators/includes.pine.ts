(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const includes_native = array.includes(arr1, 10);
                const includes_var = array.includes(arr2, 20);
            
                plotchar(includes_native, '_plotchar');
                plot(includes_var, '_plot');
            
                return {
                    includes_native,
                    includes_var,
                };
};
