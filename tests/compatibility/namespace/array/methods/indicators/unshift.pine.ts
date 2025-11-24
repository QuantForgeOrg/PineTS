(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
            array.unshift(arr1, 99);
            array.unshift(arr2, 88);
        
            const size1 = array.size(arr1);
            const size2 = array.size(arr2);
            
            plotchar(size1, '_plotchar');
            plot(size2, '_plot');
        
            const unshift_native = arr1.array;
            const unshift_var = arr2.array;
            
                return {
                    unshift_native,
                    unshift_var,
                };
};
