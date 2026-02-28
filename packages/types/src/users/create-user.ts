export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  phone?: string;
  departmentId?: string;
}
