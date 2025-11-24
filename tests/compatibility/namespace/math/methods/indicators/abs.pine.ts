(context) => {
    const { close, open } = context.data;
    const math = context.math;
    const { plot, plotchar } = context.core;

    const abs_native = math.abs(close);
    const _close = close;
    const abs_var = math.abs(_close);
    const abs_open = math.abs(open);

    plotchar(abs_native, '_plotchar');
    plot(abs_var, '_plot');

    return {
        abs_native,
        abs_var,
        abs_open,
    };
};

