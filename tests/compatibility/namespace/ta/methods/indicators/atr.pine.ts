(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const atr_native = ta.atr(14);
    const atr_var = ta.atr(21);

    plotchar(atr_native, '_plotchar');
    plot(atr_var, '_plot');

    return {
        atr_native,
        atr_var,
    };
};

