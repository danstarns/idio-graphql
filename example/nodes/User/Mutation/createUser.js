function createUser(root, args, contex) {
    return {
        name: args.name,
        age: args.age
    };
}

module.exports = createUser;
