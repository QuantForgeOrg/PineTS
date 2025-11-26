(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const median_native = ta.median(close, 9);
    const _close = close;
    const median_var = ta.median(_close, 20);
    const median_open = ta.median(open, 9);

    plotchar(median_native, '_plotchar');
    plot(median_var, '_plot');

    return {
        median_native,
        median_var,
        median_open,
    };
};

