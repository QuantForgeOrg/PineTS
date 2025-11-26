(context) => {
    const { close, open } = context.data;
    const math = context.math;
    const { plot, plotchar } = context.core;

    const sqrt_native = math.sqrt(100);
    const sqrt_var = math.sqrt(144);
    const sqrt_sixteen = math.sqrt(16);

    plotchar(sqrt_native, '_plotchar');
    plot(sqrt_var, '_plot');

    return {
        sqrt_native,
        sqrt_var,
        sqrt_sixteen,
    };
};

