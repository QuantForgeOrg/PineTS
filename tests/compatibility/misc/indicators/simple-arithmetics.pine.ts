(context) => {
    const { close, open } = context.data;
    const { plot, plotchar } = context.core;

    const close_minus_open = close - open;
    const close_plus_open = close + open;

    const oo = open;
    const cc = close;

    const cc_minus_oo = cc - oo;
    const cc_plus_oo = cc + oo;

    plotchar(cc_minus_oo, '_plotchar');
    plot(cc_plus_oo, '_plot');

    return {
        close_minus_open,
        close_plus_open,
        cc_minus_oo,
        cc_plus_oo,
    };
};
