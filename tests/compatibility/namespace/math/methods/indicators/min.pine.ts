(context) => {
    const { close, open, low } = context.data;
    const math = context.math;
    const { plot, plotchar } = context.core;

    const min_native = math.min(close, open);
    const _close = close;
    const _open = open;
    const min_var = math.min(_close, _open);
    const min_three = math.min(close, open, low);

    plotchar(min_native, '_plotchar');
    plot(min_var, '_plot');

    return {
        min_native,
        min_var,
        min_three,
    };
};

