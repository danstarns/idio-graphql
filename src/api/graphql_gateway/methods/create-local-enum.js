/**
 * @typedef {import('../../idio-enum.js')} IdioEnum
 */

/**
 *
 * @param {Object} options
 * @param {IdioEnum} options.IdioEnum
 */
function createLocalEnum({ IdioEnum }) {
    return (introspection) => {
        return new IdioEnum({
            ...introspection
        });
    };
}

module.exports = createLocalEnum;
