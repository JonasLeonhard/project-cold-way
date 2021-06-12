import { User, UserAttributes } from './models/user.model';

function getUserById(id: number) {
    return User.findByPk(id);
}

function getUserByEmail(email: string) {
    return User.findOne({ where: { email: email }});
}

function createUser(user: UserAttributes) {
    return User.create(user)
}

const UserRepository = {
    getUserById,
    getUserByEmail,
    createUser
};

export { 
    UserRepository,
    User,
    UserAttributes
}