const siteConfig = {
  title: 'idio-graphql',
  tagline: 'Methods to enable developers to modularize a GraphQL API into individual, maintainable, modules.',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  projectName: 'idio-graphql',
  repoUrl: "https://github.com/danstarns/idio-graphql",
  organizationName: 'idio-graphql',
  headerLinks: [
    { doc: 'getting-started', label: 'Guides' },
    { doc: 'index', label: 'API' },
  ],
  colors: {
    primaryColor: '#191341',
    secondaryColor: '#110d2d',
  },
  copyright: `MIT`,
  highlight: {
    theme: 'vs2015',
    hljs: (highlightJsInstance) => {
      highlightJsInstance.registerLanguage("graphql", () => {
        return {
          aliases: ["gql"],
          keywords: {
            keyword:
              "query mutation subscription|10 type interface union scalar fragment|10 enum on ...",
            literal: "true false null"
          },
          contains: [
            highlightJsInstance.HASH_COMMENT_MODE,
            highlightJsInstance.QUOTE_STRING_MODE,
            highlightJsInstance.NUMBER_MODE,
            {
              className: "type",
              begin: "[^\\w][A-Z][a-z]",
              end: "\\W",
              excludeEnd: true
            },
            {
              className: "literal",
              begin: "[^\\w][A-Z][A-Z]",
              end: "\\W",
              excludeEnd: true
            },
            { className: "variable", begin: "\\$", end: "\\W", excludeEnd: true },
            {
              className: "keyword",
              begin: "[.]{2}",
              end: "\\."
            },
            {
              className: "meta",
              begin: "@",
              end: "\\W",
              excludeEnd: true
            }
          ],
          illegal: /([;<']|BEGIN)/
        }
      });
    }
  },
  scripts: ['https://buttons.github.io/buttons.js'],
  onPageNav: 'separate',
  cleanUrl: true,
  enableUpdateTime: true,
  defaultVersionShown: "2.0.3"
};

module.exports = siteConfig;
