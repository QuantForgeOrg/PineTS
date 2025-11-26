(context) => {
    const { high, close } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const pivothigh_native = ta.pivothigh(high, 5, 5);
    const _high = high;
    const pivothigh_var = ta.pivothigh(_high, 3, 3);

    plotchar(pivothigh_native, '_plotchar');
    plot(pivothigh_var, '_plot');

    return {
        pivothigh_native,
        pivothigh_var,
    };
};

