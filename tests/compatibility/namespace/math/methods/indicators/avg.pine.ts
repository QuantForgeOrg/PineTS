(context) => {
    const { close, open } = context.data;
    const math = context.math;
    const { plot, plotchar } = context.core;

    const avg_native = math.avg(close, open);
    const _close = close;
    const _open = open;
    const avg_var = math.avg(_close, _open);
    const avg_single = math.avg(close);

    plotchar(avg_native, '_plotchar');
    plot(avg_var, '_plot');

    return {
        avg_native,
        avg_var,
        avg_single,
    };
};

