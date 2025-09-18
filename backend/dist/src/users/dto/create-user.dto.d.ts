export declare class CreateUserDto {
    fullName: string;
    email: string;
    password: string;
    referralCode?: string;
}
export declare class RegisterDto extends CreateUserDto {
    referralCode: string;
}
