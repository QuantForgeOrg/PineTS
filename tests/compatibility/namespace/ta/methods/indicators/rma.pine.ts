(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const rma_native = ta.rma(close, 9);
    const _close = close;
    const rma_var = ta.rma(_close, 20);
    const rma_open = ta.rma(open, 9);

    plotchar(rma_native, '_plotchar');
    plot(rma_var, '_plot');

    return {
        rma_native,
        rma_var,
        rma_open,
    };
};

