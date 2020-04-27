// plugins that we are going to use
import babel from "rollup-plugin-babel";
import commonjs from "@rollup/plugin-commonjs";

function CJSPipeline() {
    return [
        commonjs(),
        babel({
            exclude: "node_modules/**",
            babelrc: false,
            runtimeHelpers: true,
            presets: [
                "minify",
                [
                    "@babel/preset-env",
                    {
                        targets: {
                            node: "10"
                        },
                        useBuiltIns: "usage",
                        corejs: 3
                    }
                ]
            ],
            plugins: [
                "@babel/plugin-transform-runtime",
                [
                    "add-module-exports",
                    {
                        addDefaultProperty: true
                    }
                ]
            ],
            comments: false
        })
    ];
}

export default {
    input: "src/index.js",
    output: {
        file: "dist/index.js",
        format: "cjs"
    },
    plugins: CJSPipeline()
};
