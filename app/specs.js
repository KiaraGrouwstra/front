import 'reflect-metadata';
const requireAll = (requireContext) => { requireContext.keys().map(requireContext); };

requireAll(require.context('./', true, /\.spec\.[tj]s$/));

// require('./1st.spec')
// require('./app.spec')
// require('./colored.spec')
// require('./dynamic_class.spec')
// require('./js.spec')
// require('./parser.spec')
// require('./pipes.spec')
// require('./rx_helpers.spec')
// require('./ws.spec')
