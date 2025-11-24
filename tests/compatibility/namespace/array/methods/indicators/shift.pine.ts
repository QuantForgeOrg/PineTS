(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
                const shift_native = array.shift(arr1);
                const shift_var = array.shift(arr2);
            
                plotchar(shift_native, '_plotchar');
                plot(shift_var, '_plot');
            
                return {
                    shift_native,
                    shift_var,
                };
};
