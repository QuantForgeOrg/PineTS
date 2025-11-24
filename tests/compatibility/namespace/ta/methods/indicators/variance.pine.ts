(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const variance_native = ta.variance(close, 9);
    const _close = close;
    const variance_var = ta.variance(_close, 20);
    const variance_open = ta.variance(open, 9);

    plotchar(variance_native, '_plotchar');
    plot(variance_var, '_plot');

    return {
        variance_native,
        variance_var,
        variance_open,
    };
};

