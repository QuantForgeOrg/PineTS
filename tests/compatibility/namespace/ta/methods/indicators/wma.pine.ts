(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const wma_native = ta.wma(close, 9);
    const _close = close;
    const wma_var = ta.wma(_close, 20);
    const wma_open = ta.wma(open, 9);

    plotchar(wma_native, '_plotchar');
    plot(wma_var, '_plot');

    return {
        wma_native,
        wma_var,
        wma_open,
    };
};

