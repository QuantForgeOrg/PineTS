(context) => {
    const { close, open } = context.data;
    const math = context.math;
    const { plot, plotchar } = context.core;

    const log_native = math.log(10);
    const log_var = math.log(100);
    const log_thousand = math.log(1000);

    plotchar(log_native, '_plotchar');
    plot(log_var, '_plot');

    return {
        log_native,
        log_var,
        log_thousand,
    };
};

