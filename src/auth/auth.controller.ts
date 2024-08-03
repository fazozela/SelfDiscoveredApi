import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto, LoginUserDto } from "./dto";
import { Auth, GetUser } from "./decorators";
import { User } from "./entities/user.entity";
import { ValidRoles } from "./interfaces";
import { UserRoleGuard } from "./guards/user-role.guard";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(
    @Body()
    loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser()
      user: User
  ){
    return this.authService.checkAuthStatus(user);
  }

}
