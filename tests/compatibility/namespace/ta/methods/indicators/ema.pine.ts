(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const ema_native = ta.ema(close, 9);
    const _close = close;
    const ema_var = ta.ema(_close, 20);
    const ema_open = ta.ema(open, 9);

    plotchar(ema_native, '_plotchar');
    plot(ema_var, '_plot');

    return {
        ema_native,
        ema_var,
        ema_open,
    };
};

