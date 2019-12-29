const { CONTEXT_INDEX = 2 } = process.env;

/* The index on the context object is passed to, as the 
   params of a resolve function
*/
module.exports = CONTEXT_INDEX;
