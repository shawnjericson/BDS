import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../users/dto/login.dto';
import { RegisterDto } from '../users/dto/create-user.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
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
    validateUser(payload: any): Promise<{
        id: number;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        referredBy: number | null;
        managerId: number | null;
        status: string;
        createdAt: Date;
        wallet: {
            id: number;
            balance: import("@prisma/client/runtime/library").Decimal;
        } | null;
        referrer: {
            id: number;
            email: string | null;
            referralCode: string | null;
            fullName: string;
        } | null;
        referrals: {
            id: number;
            email: string | null;
            fullName: string;
            createdAt: Date;
        }[];
        manager: {
            id: number;
            email: string | null;
            referralCode: string | null;
            fullName: string;
        } | null;
        managedUsers: {
            id: number;
            email: string | null;
            referralCode: string | null;
            fullName: string;
        }[];
    } | null>;
}
