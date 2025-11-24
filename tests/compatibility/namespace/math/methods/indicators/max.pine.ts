(context) => {
    const { close, open, high } = context.data;
    const math = context.math;
    const { plot, plotchar } = context.core;

    const max_native = math.max(close, open);
    const _close = close;
    const _open = open;
    const max_var = math.max(_close, _open);
    const max_three = math.max(close, open, high);

    plotchar(max_native, '_plotchar');
    plot(max_var, '_plot');

    return {
        max_native,
        max_var,
        max_three,
    };
};

