(context) => {
    const { close, open } = context.data;
    const math = context.math;
    const { plot, plotchar } = context.core;

    const pow_native = math.pow(2, 3);
    const pow_var = math.pow(3, 2);
    const pow_ten = math.pow(10, 2);

    plotchar(pow_native, '_plotchar');
    plot(pow_var, '_plot');

    return {
        pow_native,
        pow_var,
        pow_ten,
    };
};

