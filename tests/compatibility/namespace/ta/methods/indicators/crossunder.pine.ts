(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const crossunder_native = ta.crossunder(close, open);
    const _close = close;
    const _open = open;
    const crossunder_var = ta.crossunder(_close, _open);
    const crossunder_reverse = ta.crossunder(open, close);

    plotchar(crossunder_native, '_plotchar');
    plot(crossunder_var, '_plot');

    return {
        crossunder_native,
        crossunder_var,
        crossunder_reverse,
    };
};

