(context) => {
    const { high, low } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const lowest_native = ta.lowest(low, 9);
    const _low = low;
    const lowest_var = ta.lowest(_low, 20);
    const lowest_high = ta.lowest(high, 9);

    plotchar(lowest_native, '_plotchar');
    plot(lowest_var, '_plot');

    return {
        lowest_native,
        lowest_var,
        lowest_high,
    };
};

