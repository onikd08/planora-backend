export interface ICreateUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    gender?: string;
    profilePhoto?: string;
}

export interface ILoginUser {
    email: string;
    password: string;
}