(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const change_native = ta.change(close);
    const _close = close;
    const change_var = ta.change(_close);
    const change_open = ta.change(open);

    plotchar(change_native, '_plotchar');
    plot(change_var, '_plot');

    return {
        change_native,
        change_var,
        change_open,
    };
};

