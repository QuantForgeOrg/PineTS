(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const hma_native = ta.hma(close, 9);
    const _close = close;
    const hma_var = ta.hma(_close, 20);
    const hma_open = ta.hma(open, 9);

    plotchar(hma_native, '_plotchar');
    plot(hma_var, '_plot');

    return {
        hma_native,
        hma_var,
        hma_open,
    };
};

