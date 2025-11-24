(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(5, 10);
                const arr2 = array.new(5, 20);
                
            array.push(arr1, close[0]);
            array.push(arr2, open[0]);
        
            const size1 = array.size(arr1);
            const size2 = array.size(arr2);
            
            plotchar(size1, '_plotchar');
            plot(size2, '_plot');
        
            const push_native = arr1.array;
            const push_var = arr2.array;
            
                return {
                    push_native,
                    push_var,
                };
};
