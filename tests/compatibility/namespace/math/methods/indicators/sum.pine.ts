(context) => {
    const { close, open } = context.data;
    const math = context.math;
    const { plot, plotchar } = context.core;

    const sum_native = math.sum(close, 5);
    const _close = close;
    const sum_var = math.sum(_close, 10);
    const sum_open = math.sum(open, 5);

    plotchar(sum_native, '_plotchar');
    plot(sum_var, '_plot');

    return {
        sum_native,
        sum_var,
        sum_open,
    };
};

