(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
            array.remove(arr1, 1);
            array.remove(arr2, 2);
        
            const size1 = array.size(arr1);
            const size2 = array.size(arr2);
            
            plotchar(size1, '_plotchar');
            plot(size2, '_plot');
        
            const remove_native = arr1.array;
            const remove_var = arr2.array;
            
                return {
                    remove_native,
                    remove_var,
                };
};
