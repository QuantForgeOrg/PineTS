(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const linreg_native = ta.linreg(close, 9, 0);
    const _close = close;
    const linreg_var = ta.linreg(_close, 20, 0);
    const linreg_open = ta.linreg(open, 9);

    plotchar(linreg_native, '_plotchar');
    plot(linreg_var, '_plot');

    return {
        linreg_native,
        linreg_var,
        linreg_open,
    };
};

