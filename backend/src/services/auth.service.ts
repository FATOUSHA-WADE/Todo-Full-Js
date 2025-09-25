import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserRepository } from '../repository/user.repository';
import { LoginRequest, AuthResponse, RefreshRequest, RefreshResponse, JWTPayload } from '../interfaces/IAuth';
import { NotFoundError, ValidationError } from '../errors/AppError';

export class AuthService {
    private userRepository: UserRepository;
    private accessTokenSecret: string;
    private refreshTokenSecret: string;
    private accessTokenExpiry: string;
    private refreshTokenExpiry: string;

    constructor() {
        this.userRepository = new UserRepository();
        this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'fatousha';
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'fatousha';
        this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '1h';
        this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    }

    async login({ email, password }: LoginRequest): Promise<AuthResponse> {

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundError('Email ou mot de passe incorrect');
        }


        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ValidationError('Email ou mot de passe incorrect');
        }


        const accessToken = this.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        const refreshToken = this.generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                
                role: user.role
            }
        };
    }

    async refreshToken({ refreshToken }: RefreshRequest): Promise<RefreshResponse> {
        try {

            const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as JWTPayload;


            const user = await this.userRepository.findById(decoded.userId);
            if (!user) {
                throw new NotFoundError('Utilisateur non trouvé');
            }


            const accessToken = this.generateAccessToken({
                userId: user.id,
                email: user.email,
                role: user.role
            });

            return { accessToken };
        } catch (error) {
            throw new ValidationError('Token de rafraîchissement invalide');
        }
    }

    private generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
        return jwt.sign(payload, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiry
        } as jwt.SignOptions);
    }

    private generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
        return jwt.sign(payload, this.refreshTokenSecret, {
            expiresIn: this.refreshTokenExpiry
        } as jwt.SignOptions);
    }

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    }

    verifyAccessToken(token: string): JWTPayload {
        try {
            return jwt.verify(token, this.accessTokenSecret) as JWTPayload;
        } catch (error) {
            throw new ValidationError('Token d\'accès invalide');
        }
    }
}
