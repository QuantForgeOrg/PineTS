(context) => {
    const { high, low } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const highest_native = ta.highest(high, 9);
    const _high = high;
    const highest_var = ta.highest(_high, 20);
    const highest_low = ta.highest(low, 9);

    plotchar(highest_native, '_plotchar');
    plot(highest_var, '_plot');

    return {
        highest_native,
        highest_var,
        highest_low,
    };
};

