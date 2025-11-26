(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const sma_native = ta.sma(close, 20);
    const src = close;
    const sma_var = ta.sma(src, 20);
    const sma_open = ta.sma(open, 10);

    plotchar(sma_native, '_plotchar');
    plot(sma_var, '_plot');

    return {
        sma_native,
        sma_var,
        sma_open,
    };
};
