export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  departmentId: string;
  phone?: string;
}
