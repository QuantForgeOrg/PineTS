(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const crossover_native = ta.crossover(close, open);
    const _close = close;
    const _open = open;
    const crossover_var = ta.crossover(_close, _open);
    const crossover_reverse = ta.crossover(open, close);

    plotchar(crossover_native, '_plotchar');
    plot(crossover_var, '_plot');

    return {
        crossover_native,
        crossover_var,
        crossover_reverse,
    };
};

