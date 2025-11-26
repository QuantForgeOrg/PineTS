(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const mom_native = ta.mom(close, 9);
    const _close = close;
    const mom_var = ta.mom(_close, 20);
    const mom_open = ta.mom(open, 9);

    plotchar(mom_native, '_plotchar');
    plot(mom_var, '_plot');

    return {
        mom_native,
        mom_var,
        mom_open,
    };
};

