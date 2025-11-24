(context) => {
    const { close, open, volume } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const vwma_native = ta.vwma(close, volume, 9);
    const _close = close;
    const _volume = volume;
    const vwma_var = ta.vwma(_close, _volume, 20);
    const vwma_open = ta.vwma(open, volume, 9);

    plotchar(vwma_native, '_plotchar');
    plot(vwma_var, '_plot');

    return {
        vwma_native,
        vwma_var,
        vwma_open,
    };
};

