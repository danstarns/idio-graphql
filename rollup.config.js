import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import sourcemaps from "rollup-plugin-sourcemaps";

function CJSPipeline() {
    return [
        sourcemaps(),
        commonjs(),
        babel({
            exclude: "node_modules/**",
            babelrc: false,
            babelHelpers: "runtime",
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
        sourcemap: true,
        file: "dist/index.js",
        format: "cjs"
    },
    plugins: CJSPipeline()
};
