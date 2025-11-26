(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const roc_native = ta.roc(close, 9);
    const _close = close;
    const roc_var = ta.roc(_close, 20);
    const roc_open = ta.roc(open, 9);

    plotchar(roc_native, '_plotchar');
    plot(roc_var, '_plot');

    return {
        roc_native,
        roc_var,
        roc_open,
    };
};

