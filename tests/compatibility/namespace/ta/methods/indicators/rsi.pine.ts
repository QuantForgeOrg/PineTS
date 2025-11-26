(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const rsi_native = ta.rsi(close, 14);
    const _close = close;
    const rsi_var = ta.rsi(_close, 21);
    const rsi_open = ta.rsi(open, 14);

    plotchar(rsi_native, '_plotchar');
    plot(rsi_var, '_plot');

    return {
        rsi_native,
        rsi_var,
        rsi_open,
    };
};

