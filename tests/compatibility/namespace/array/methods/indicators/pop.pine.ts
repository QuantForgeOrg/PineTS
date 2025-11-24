(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const pop_native = array.pop(arr1);
                const pop_var = array.pop(arr2);
            
                plotchar(pop_native, '_plotchar');
                plot(pop_var, '_plot');
            
                return {
                    pop_native,
                    pop_var,
                };
};
