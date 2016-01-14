import 'reflect-metadata';
const requireAll = (requireContext) => { requireContext.keys().map(requireContext); };

requireAll(require.context('./', true, /\.spec\.[tj]s$/));
