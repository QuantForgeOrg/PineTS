(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const stdev_native = ta.stdev(close, 9);
    const _close = close;
    const stdev_var = ta.stdev(_close, 20);
    const stdev_open = ta.stdev(open, 9);

    plotchar(stdev_native, '_plotchar');
    plot(stdev_var, '_plot');

    return {
        stdev_native,
        stdev_var,
        stdev_open,
    };
};

