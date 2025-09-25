import * as bcrypt from 'bcrypt';
import { UserRepository } from "../repository/user.repository";
import { User } from "../interfaces/user.interface";
import { ActivityLogService } from './activityLog.service.js';

type UserCreateInput = {
    email: string;
    password: string;
    name?: string | null;
    role?: string;
};

export class UserService {
    private userRepository: UserRepository
    constructor() {
        this.userRepository = new UserRepository();
    }

    async createUser(data: UserCreateInput): Promise<User> {
        const hashPassword = bcrypt.hashSync(data.password, 10);
        const { password, ...userDataWithoutPassword } = data;
        const user = await this.userRepository.create({ ...userDataWithoutPassword, password: hashPassword });
        return user;
    }

    async getUserById(id: number): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.findAll();
    }

    async updateUser(id: number, data: { email?: string; name?: string | null }): Promise<User> {
        return this.userRepository.update(id, data);
    }

    async deleteUser(id: number): Promise<User> {
        return this.userRepository.delete(id);
}
}