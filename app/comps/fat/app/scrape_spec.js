// TODO: update so as to incorporate nesting
export let scrape_spec = [
  {
    name: 'url',
    type: 'string',
    format: 'url',
    required: true,
    description: 'the URL to scrape and extract',
  },
  {
    // type: 'array',
    // items: {
    type: 'object',
    additionalProperties: {
      type: 'string',
      // format: 'json',

      required: true,
      name: 'floki selector',
      description: "use CSS selectors, use e.g. `a@src` to get a URL's `src` attribute, `a` to get its text, or `a@` to get its outer html",
      // in: 'path',
    },
    minItems: 1,

    // required: true,
    name: 'parselet',
    description: 'json parselet',
    // in: 'path',
  },
];
