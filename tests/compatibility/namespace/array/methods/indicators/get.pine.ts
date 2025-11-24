(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const get_native = array.get(arr1, 0);
                const get_var = array.get(arr2, 1);
            
                plotchar(get_native, '_plotchar');
                plot(get_var, '_plot');
            
                return {
                    get_native,
                    get_var,
                };
};
