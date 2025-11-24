(context) => {
            const { close, open } = context.data;
                const array = context.array;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(3, 10);
                const arr2 = array.new(2, 20);
                const arr3 = array.new(3, 30);
                const arr4 = array.new(2, 40);
                
                const result1 = array.concat(arr1, arr2);
                const result2 = array.concat(arr3, arr4);
            
                plotchar(result1, '_plotchar');
                plot(result2, '_plot');
            
                const concat_native = result1.array;
                const concat_var = result2.array;
            
                return {
                    concat_native,
                    concat_var,
                };
};
