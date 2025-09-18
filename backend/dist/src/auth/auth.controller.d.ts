import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { RegisterDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: number;
            role: string;
            email: string | null;
            referralCode: string | null;
            fullName: string;
            status: string;
            createdAt: Date;
        };
        access_token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: number;
            fullName: string;
            email: string | null;
            referralCode: string | null;
            status: string;
        };
        access_token: string;
    }>;
}
