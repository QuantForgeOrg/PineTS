(context) => {
    const { low, close } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const pivotlow_native = ta.pivotlow(low, 5, 5);
    const _low = low;
    const pivotlow_var = ta.pivotlow(_low, 3, 3);

    plotchar(pivotlow_native, '_plotchar');
    plot(pivotlow_var, '_plot');

    return {
        pivotlow_native,
        pivotlow_var,
    };
};

