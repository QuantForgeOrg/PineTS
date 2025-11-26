(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const dev_native = ta.dev(close, 9);
    const _close = close;
    const dev_var = ta.dev(_close, 20);
    const dev_open = ta.dev(open, 9);

    plotchar(dev_native, '_plotchar');
    plot(dev_var, '_plot');

    return {
        dev_native,
        dev_var,
        dev_open,
    };
};

