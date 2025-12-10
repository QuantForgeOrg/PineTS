// All known data variables in the context
export const CONTEXT_DATA_VARS = ['open', 'high', 'low', 'close', 'volume', 'hl2', 'hlc3', 'ohlc4', 'openTime', 'closeTime'];

// All known Pine variables in the context
export const CONTEXT_PINE_VARS = [
    'input',
    'ta',
    'math',
    'request',
    'array',
    'na',
    'plotchar',
    'color',
    'plot',
    'nz',
    'strategy',
    'library',
    'str',
    'box',
    'line',
    'label',
    'table',
    'map',
    'matrix',
    'syminfo',
    'barstate',
    'log',
    'map',

    //builtin variables
    'bar_index',
    'last_bar_index',
    'last_bar_time',

    // Pine Script enum types
    'order',
    'currency',
];

// All known core variables in the context
export const CONTEXT_CORE_VARS = ['na', 'nz', 'plot', 'plotchar', 'color'];
