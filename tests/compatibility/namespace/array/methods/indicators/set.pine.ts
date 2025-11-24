(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
            array.set(arr1, 0, 100);
            array.set(arr2, 1, 200);
        
            const val1 = array.get(arr1, 0);
            const val2 = array.get(arr2, 1);
            
            plotchar(val1, '_plotchar');
            plot(val2, '_plot');
        
            const set_native = arr1.array;
            const set_var = arr2.array;
            
                return {
                    set_native,
                    set_var,
                };
};
