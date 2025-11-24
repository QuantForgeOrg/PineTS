(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
            array.insert(arr1, 1, 55);
            array.insert(arr2, 2, 66);
        
            const size1 = array.size(arr1);
            const size2 = array.size(arr2);
            
            plotchar(size1, '_plotchar');
            plot(size2, '_plot');
        
            const insert_native = arr1.array;
            const insert_var = arr2.array;
            
                return {
                    insert_native,
                    insert_var,
                };
};
