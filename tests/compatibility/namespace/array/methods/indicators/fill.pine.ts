(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
            array.fill(arr1, 50);
            array.fill(arr2, 100);
        
            const val1 = array.get(arr1, 0);
            const val2 = array.get(arr2, 0);
            
            plotchar(val1, '_plotchar');
            plot(val2, '_plot');
        
            const fill_native = arr1.array;
            const fill_var = arr2.array;
            
                return {
                    fill_native,
                    fill_var,
                };
};
