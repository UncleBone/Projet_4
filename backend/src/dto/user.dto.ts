export type CreateUserDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  admin: boolean;
}

export type UserResponseDto = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  token: string;
}