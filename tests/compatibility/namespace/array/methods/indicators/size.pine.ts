(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const size_native = array.size(arr1);
                const size_var = array.size(arr2);
            
                plotchar(size_native, '_plotchar');
                plot(size_var, '_plot');
            
                return {
                    size_native,
                    size_var,
                };
};
