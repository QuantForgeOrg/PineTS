(context) => {
            const { close, open } = context.data;
            const array = context.array;
            const { plot, plotchar } = context.core;

            const arr1 = array.new(5, 10);
            const arr2 = array.new(5, 20);
            const arr3 = array.new(5, 30);
            const arr4 = array.new(5, 40);
            
            const covariance_native = array.covariance(arr1, arr2);
            const covariance_var = array.covariance(arr3, arr4);

            plotchar(covariance_native, '_plotchar');
            plot(covariance_var, '_plot');

            return {
                covariance_native,
                covariance_var,
            };
};
